"""Artifact parsing helpers."""

from pathlib import Path
from typing import Dict, List, Optional

from ..utils.file_utils import read_text_if_exists


class ArtifactParser:
    """Read artifact contents and classify references."""

    def summarize_attachment(self, path: Optional[str]) -> Optional[Dict[str, str]]:
        """Return attachment reference metadata."""

        if not path:
            return None
        resolved = Path(path)
        return {
            "path": str(resolved),
            "exists": "true" if resolved.exists() else "false",
            "type": resolved.suffix.lstrip(".") or "unknown",
        }

    def read_error_context(self, attachment_paths: List[str]) -> Optional[str]:
        """Find and read an error-context markdown file near attachments."""

        for attachment_path in attachment_paths:
            attachment = Path(attachment_path)
            if attachment.name == "error-context.md":
                return read_text_if_exists(attachment, limit=4000)
            sibling = attachment.parent / "error-context.md"
            if sibling.exists():
                return read_text_if_exists(sibling, limit=4000)
        return None
