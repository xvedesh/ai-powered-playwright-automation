"""Configuration models for the failure analyzer."""

from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass(frozen=True)
class OpenAIConfig:
    """Optional OpenAI enhancement configuration."""

    enabled: bool
    api_key: Optional[str] = None
    model: str = "gpt-5.4"
    base_url: str = "https://api.openai.com/v1/responses"
    timeout_seconds: int = 45


@dataclass(frozen=True)
class AnalyzerConfig:
    """Runtime configuration for a single analyzer execution."""

    playwright_report: Path
    test_results: Path
    output_md: Path
    output_json: Path
    mode: str = "local"
    log_file: Optional[Path] = None
    openai: OpenAIConfig = OpenAIConfig(enabled=False)
