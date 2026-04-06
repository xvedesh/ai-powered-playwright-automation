"""Helpers for extracting useful failure text from stack traces."""

import re
from typing import Optional

from ..utils.text_utils import compact_lines


class StacktraceParser:
    """Extract meaningful stacktrace fragments."""

    STACK_LINE_PATTERN = re.compile(r"^\s*at\s+.+", re.MULTILINE)

    def extract_key_lines(self, error_message: Optional[str], error_stack: Optional[str]) -> list[str]:
        """Return concise, high-signal error lines."""

        lines: list[str] = []
        if error_message:
            lines.extend(error_message.splitlines())
        if error_stack:
            lines.extend(error_stack.splitlines()[:12])
        return compact_lines(lines, limit=10)

    def extract_stack_fragments(self, error_stack: Optional[str], limit: int = 5) -> list[str]:
        """Return top stack frames."""

        if not error_stack:
            return []
        return compact_lines(self.STACK_LINE_PATTERN.findall(error_stack), limit=limit)
