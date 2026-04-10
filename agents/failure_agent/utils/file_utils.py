"""Filesystem helpers."""

import json
from pathlib import Path
from typing import Any, Optional


def ensure_parent(path: Path) -> None:
    """Create the parent directory for a path."""

    path.parent.mkdir(parents=True, exist_ok=True)


def read_json(path: Path) -> dict[str, Any]:
    """Read JSON from disk."""

    return json.loads(path.read_text(encoding="utf-8"))


def read_text_if_exists(path: Path, limit: Optional[int] = None) -> Optional[str]:
    """Read a text file when present, optionally truncating."""

    if not path.exists() or not path.is_file():
        return None

    text = path.read_text(encoding="utf-8", errors="replace")
    if limit is not None:
        return text[:limit]
    return text


def write_text(path: Path, contents: str) -> None:
    """Write UTF-8 text to disk."""

    ensure_parent(path)
    path.write_text(contents, encoding="utf-8")


def write_json(path: Path, payload: Any) -> None:
    """Write deterministic JSON to disk."""

    ensure_parent(path)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
