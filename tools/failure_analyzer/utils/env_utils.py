"""Minimal .env loading for Python tooling."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Dict


def load_dotenv_if_present(path: Path) -> Dict[str, str]:
    """Load a simple .env file into os.environ without overriding existing values."""

    loaded: Dict[str, str] = {}
    if not path.exists() or not path.is_file():
        return loaded

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value
            loaded[key] = value
    return loaded


def get_bool_env(name: str, default: bool) -> bool:
    """Read a boolean environment variable."""

    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}
