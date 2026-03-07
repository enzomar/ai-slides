#!/usr/bin/env python3
"""
text-to-puml.py
───────────────────────────────────────────────────────────────────────────────
Generate a PlantUML diagram from a plain-text description using any of the
major AI providers (or a local model).

Supported providers / models:
  openai     gpt-4o (default), gpt-4-turbo, gpt-3.5-turbo, o1-preview …
  anthropic  claude-3-5-sonnet-20241022 (default), claude-3-haiku …
  gemini     gemini-1.5-pro (default), gemini-1.5-flash …
  ollama     llama3 (default) — must be running: `ollama serve`
  gpt4all    Meta-Llama-3-8B-Instruct (default) — GPT4All desktop must be open

Usage:
  python3 scripts/text-to-puml.py description.txt
  python3 scripts/text-to-puml.py description.txt --provider anthropic
  python3 scripts/text-to-puml.py description.txt --provider ollama --model mistral
  python3 scripts/text-to-puml.py description.txt --out diagrams/mydiagram.puml
  python3 scripts/text-to-puml.py description.txt --type sequence

Environment variables (one per provider used):
  OPENAI_API_KEY
  ANTHROPIC_API_KEY
  GEMINI_API_KEY  (Google AI Studio key)

Output:
  diagrams/<stem>.puml   — PlantUML source
  diagrams/<stem>.link   — PlantUML server URLs (via generate-plantuml-links.mjs)
───────────────────────────────────────────────────────────────────────────────
"""

import argparse
import os
import re
import subprocess
import sys
import textwrap
import zlib
import base64
from pathlib import Path

# ── PlantUML encoding (Python port of generate-plantuml-links.mjs) ───────────

PLANTUML_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
STD_B64_ALPHABET  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

def _to_plantuml_b64(b64: str) -> str:
    out = []
    for ch in b64:
        idx = STD_B64_ALPHABET.find(ch)
        out.append(PLANTUML_ALPHABET[idx] if idx != -1 else PLANTUML_ALPHABET[0])
    return "".join(out)

def encode_puml(text: str) -> str:
    """Compress + encode PlantUML source → URL token."""
    compressed = zlib.compress(text.encode("utf-8"), level=9)[2:-4]  # raw deflate strip
    b64 = base64.b64encode(compressed).decode("ascii").rstrip("=")
    return _to_plantuml_b64(b64)

def puml_links(text: str) -> dict:
    token = encode_puml(text)
    base  = "https://www.plantuml.com/plantuml"
    return {
        "uml": f"{base}/uml/{token}",
        "svg": f"{base}/svg/{token}",
        "png": f"{base}/png/{token}",
    }

# ── System prompt ─────────────────────────────────────────────────────────────

def build_system_prompt(diagram_type: str) -> str:
    type_hint = f"The diagram type should be **{diagram_type}** unless the description clearly implies another type." if diagram_type != "auto" else "Choose the most appropriate diagram type based on the description."
    return textwrap.dedent(f"""
        You are an expert PlantUML diagram generator.
        {type_hint}

        Rules:
        - Output ONLY valid PlantUML source code — no explanations, no markdown fences.
        - Start with @startuml and end with @enduml.
        - Use skinparam to improve readability (white background, modern fonts).
        - Prefer left-to-right direction for wide diagrams (left to right direction).
        - Keep labels concise (≤ 6 words each).
        - If the description mentions specific tools, frameworks or brands, use them as node labels.
        - Do not include a title unless the description explicitly mentions one.
    """).strip()

def build_user_prompt(description: str) -> str:
    return f"Generate a PlantUML diagram for the following description:\n\n{description.strip()}"

# ── Provider implementations ──────────────────────────────────────────────────

def call_openai(description: str, model: str, system: str) -> str:
    try:
        from openai import OpenAI
    except ImportError:
        sys.exit("openai package not installed. Run: pip install openai")

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        sys.exit("OPENAI_API_KEY environment variable is not set.")

    client   = OpenAI(api_key=api_key)
    messages = [
        {"role": "system", "content": system},
        {"role": "user",   "content": build_user_prompt(description)},
    ]
    resp = client.chat.completions.create(model=model, messages=messages, temperature=0.2)
    return resp.choices[0].message.content.strip()


def call_anthropic(description: str, model: str, system: str) -> str:
    try:
        import anthropic
    except ImportError:
        sys.exit("anthropic package not installed. Run: pip install anthropic")

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("ANTHROPIC_API_KEY environment variable is not set.")

    client = anthropic.Anthropic(api_key=api_key)
    resp   = client.messages.create(
        model=model,
        max_tokens=4096,
        system=system,
        messages=[{"role": "user", "content": build_user_prompt(description)}],
    )
    return resp.content[0].text.strip()


def call_gemini(description: str, model: str, system: str) -> str:
    try:
        import google.generativeai as genai
    except ImportError:
        sys.exit("google-generativeai package not installed. Run: pip install google-generativeai")

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("GEMINI_API_KEY environment variable is not set.")

    genai.configure(api_key=api_key)
    gen_model = genai.GenerativeModel(
        model_name=model,
        system_instruction=system,
    )
    resp = gen_model.generate_content(build_user_prompt(description))
    return resp.text.strip()


def call_ollama(description: str, model: str, system: str) -> str:
    """Uses Ollama's local REST API (ollama serve must be running)."""
    try:
        import urllib.request, json
    except ImportError:
        pass  # stdlib

    payload = json.dumps({
        "model":    model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user",   "content": build_user_prompt(description)},
        ],
        "stream": False,
    }).encode()

    req  = urllib.request.Request(
        "http://localhost:11434/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.loads(r.read())
        return data["message"]["content"].strip()
    except Exception as e:
        sys.exit(f"Ollama request failed: {e}\nIs `ollama serve` running?")


def call_gpt4all(description: str, model: str, system: str) -> str:
    """Uses GPT4All's local REST API (GPT4All desktop app must be open with API server enabled)."""
    try:
        import urllib.request, json
    except ImportError:
        pass  # stdlib

    # GPT4All API server is OpenAI-compatible, default port 4891
    payload = json.dumps({
        "model":    model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user",   "content": build_user_prompt(description)},
        ],
        "max_tokens": 4096,
        "temperature": 0.2,
    }).encode()

    req = urllib.request.Request(
        "http://localhost:4891/v1/chat/completions",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            data = json.loads(r.read())
        return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        sys.exit(
            f"GPT4All request failed: {e}\n"
            "Make sure GPT4All desktop is open and 'Enable API Server' is turned on in Settings."
        )

# ── Dispatch ──────────────────────────────────────────────────────────────────

PROVIDERS = {
    "openai":    ("gpt-4o",                         call_openai),
    "anthropic": ("claude-3-5-sonnet-20241022",     call_anthropic),
    "gemini":    ("gemini-1.5-pro",                 call_gemini),
    "ollama":    ("llama3",                         call_ollama),
    "gpt4all":   ("Meta-Llama-3-8B-Instruct.gguf",  call_gpt4all),
}

def generate(description: str, provider: str, model: str, diagram_type: str) -> str:
    if provider not in PROVIDERS:
        sys.exit(f"Unknown provider '{provider}'. Choose from: {', '.join(PROVIDERS)}")

    default_model, fn = PROVIDERS[provider]
    model   = model or default_model
    system  = build_system_prompt(diagram_type)

    print(f"  provider : {provider}")
    print(f"  model    : {model}")
    print(f"  type     : {diagram_type}")
    print()

    raw = fn(description, model, system)

    # Strip markdown fences if the model added them despite instructions
    raw = re.sub(r"^```[a-zA-Z]*\n?", "", raw, flags=re.MULTILINE)
    raw = re.sub(r"\n?```$",          "", raw, flags=re.MULTILINE)
    raw = raw.strip()

    # Ensure the output is wrapped in @startuml / @enduml
    if not raw.startswith("@startuml"):
        raw = "@startuml\n" + raw
    if not raw.endswith("@enduml"):
        raw = raw + "\n@enduml"

    return raw

# ── Write outputs ─────────────────────────────────────────────────────────────

def write_outputs(puml_text: str, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(puml_text, encoding="utf-8")
    print(f"✓  PlantUML written  : {out_path}")

    # Write link file
    links      = puml_links(puml_text)
    link_path  = out_path.with_suffix(".link")
    link_lines = [
        f"uml: {links['uml']}",
        f"svg: {links['svg']}",
        f"png: {links['png']}",
    ]
    link_path.write_text("\n".join(link_lines) + "\n", encoding="utf-8")
    print(f"✓  Links written     : {link_path}")
    print()
    print("  Open in browser:")
    print(f"  {links['uml']}")
    print()
    print("  Direct SVG:")
    print(f"  {links['svg']}")

    # Try the node link-generator if available (regenerates all .link files in diagrams/)
    repo_root   = Path(__file__).parent.parent
    link_script = repo_root / "scripts" / "generate-plantuml-links.mjs"
    if link_script.exists():
        try:
            subprocess.run(
                ["node", str(link_script), str(out_path.parent)],
                check=True, capture_output=True,
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass  # node not available — link file already written above

# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Generate a PlantUML diagram from a text description using an LLM.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""
            examples:
              python3 scripts/text-to-puml.py description.txt
              python3 scripts/text-to-puml.py description.txt --provider anthropic
              python3 scripts/text-to-puml.py description.txt --provider ollama --model mistral
              python3 scripts/text-to-puml.py description.txt --type sequence --out diagrams/auth-flow.puml
              python3 scripts/text-to-puml.py description.txt --provider gpt4all
        """),
    )
    parser.add_argument("input",
        help="Path to a plain-text file describing the diagram.")
    parser.add_argument("--provider", "-p",
        default="openai",
        choices=list(PROVIDERS),
        help="AI provider to use (default: openai).")
    parser.add_argument("--model", "-m",
        default="",
        help="Model name override. Defaults to the provider's recommended model.")
    parser.add_argument("--type", "-t",
        dest="diagram_type",
        default="auto",
        choices=["auto", "sequence", "class", "component", "activity",
                 "usecase", "state", "deployment", "er", "mindmap", "gantt"],
        help="PlantUML diagram type hint (default: auto).")
    parser.add_argument("--out", "-o",
        default="",
        help="Output .puml file path. Defaults to diagrams/<input-stem>.puml.")

    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        sys.exit(f"Input file not found: {args.input}")

    description = input_path.read_text(encoding="utf-8")
    if not description.strip():
        sys.exit("Input file is empty.")

    out_path = Path(args.out) if args.out else (
        Path(__file__).parent.parent / "diagrams" / (input_path.stem + ".puml")
    )

    print(f"\n⟳  Generating PlantUML diagram from '{input_path.name}' …\n")

    puml_text = generate(description, args.provider, args.model, args.diagram_type)
    write_outputs(puml_text, out_path)

if __name__ == "__main__":
    main()
