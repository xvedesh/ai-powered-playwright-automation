"""Text normalization helpers."""

import re
from typing import Optional


def normalize_whitespace(value: str) -> str:
    """Collapse whitespace to single spaces."""

    return re.sub(r"\s+", " ", value).strip()


def compact_lines(lines: list[str], limit: int = 8) -> list[str]:
    """Normalize, deduplicate, and trim lines."""

    seen: set[str] = set()
    output: list[str] = []
    for line in lines:
        normalized = normalize_whitespace(line)
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        output.append(normalized)
        if len(output) >= limit:
            break
    return output


def keyword_hits(text: str, keywords: list[str]) -> int:
    """Count keyword matches case-insensitively."""

    lower_text = text.lower()
    return sum(1 for keyword in keywords if keyword.lower() in lower_text)


def truncate(text: Optional[str], limit: int = 400) -> Optional[str]:
    """Truncate long text fields safely."""

    if text is None or len(text) <= limit:
        return text
    return f"{text[:limit].rstrip()}..."
