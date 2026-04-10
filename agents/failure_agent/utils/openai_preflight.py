"""OpenAI connectivity preflight checks."""

from __future__ import annotations

import socket
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from dataclasses import dataclass
from urllib.parse import urlparse

from ..config import OpenAIConfig


@dataclass(frozen=True)
class OpenAIPreflightResult:
    """Result of a lightweight OpenAI connectivity check."""

    enabled: bool
    ok: bool
    status: str
    detail: str


def run_openai_preflight(config: OpenAIConfig) -> OpenAIPreflightResult:
    """Check whether the configured OpenAI endpoint is likely reachable."""

    if not config.enabled or not config.api_key:
        return OpenAIPreflightResult(
            enabled=False,
            ok=False,
            status="disabled",
            detail="OpenAI enhancement is disabled or no API key is configured.",
        )

    parsed = urlparse(config.base_url)
    host = parsed.hostname
    if not host:
        return OpenAIPreflightResult(
            enabled=True,
            ok=False,
            status="invalid_base_url",
            detail=f"Configured OpenAI base URL is invalid: {config.base_url}",
        )

    def _resolve() -> None:
        socket.getaddrinfo(host, 443)

    timeout_seconds = min(max(config.timeout_seconds, 1), 5)
    try:
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_resolve)
            future.result(timeout=timeout_seconds)
    except FuturesTimeoutError:
        return OpenAIPreflightResult(
            enabled=True,
            ok=False,
            status="dns_timeout",
            detail=f"DNS resolution for {host} exceeded {timeout_seconds}s.",
        )
    except Exception as error:
        return OpenAIPreflightResult(
            enabled=True,
            ok=False,
            status="dns_unreachable",
            detail=f"Cannot resolve {host}: {error}",
        )

    return OpenAIPreflightResult(
        enabled=True,
        ok=True,
        status="ok",
        detail=f"DNS resolution succeeded for {host}.",
    )
