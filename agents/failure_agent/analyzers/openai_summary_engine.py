"""Optional OpenAI-backed narrative enrichment."""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from ..config import OpenAIConfig
from ..models.failure_models import (
    AIEnhancedSummary,
    FailedTestAnalysis,
    FailureCluster,
    PriorityFix,
)
from ..utils.openai_preflight import run_openai_preflight


class OpenAISummaryEngine:
    """Generate an AI-enhanced summary from normalized failure data."""

    def __init__(self, config: OpenAIConfig) -> None:
        self.config = config

    def enrich(
        self,
        run_metadata: Dict[str, Any],
        analyses: List[FailedTestAnalysis],
        clusters: List[FailureCluster],
        priority_fixes: List[PriorityFix],
    ) -> Optional[AIEnhancedSummary]:
        """Return LLM-generated summary output or None if disabled/unavailable."""

        if not self.config.enabled or not self.config.api_key:
            return None

        preflight = run_openai_preflight(self.config)
        if not preflight.ok:
            return AIEnhancedSummary(
                provider="openai",
                model=self.config.model,
                enabled=False,
                executive_summary="OpenAI enhancement is configured but unavailable.",
                grouped_patterns=[],
                priority_recommendations=[],
                ci_summary=[],
                status=preflight.status,
                error=preflight.detail,
            )

        payload = self._build_payload(run_metadata, analyses, clusters, priority_fixes)

        try:
            from openai import OpenAI

            client = OpenAI(
                api_key=self.config.api_key,
                base_url=self.config.base_url.removesuffix("/responses"),
                timeout=self.config.timeout_seconds,
            )
            response = client.responses.create(**payload)
            content = self._extract_response_json(response)
        except ImportError:
            return AIEnhancedSummary(
                provider="openai",
                model=self.config.model,
                enabled=False,
                executive_summary="OpenAI enhancement is configured but the official SDK is not installed.",
                grouped_patterns=[],
                priority_recommendations=[],
                ci_summary=[],
                status="sdk_not_installed",
                error="Install dependencies with the repo's python:setup script.",
            )
        except Exception as error:
            status_code = getattr(error, "status_code", None)
            status = f"http_error:{status_code}" if status_code else "error"
            return AIEnhancedSummary(
                provider="openai",
                model=self.config.model,
                enabled=False,
                executive_summary="OpenAI enhancement was requested but could not complete.",
                grouped_patterns=[],
                priority_recommendations=[],
                ci_summary=[],
                status=status,
                error=str(error),
            )
        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            return AIEnhancedSummary(
                provider="openai",
                model=self.config.model,
                enabled=False,
                executive_summary="OpenAI returned a response that could not be parsed as structured JSON.",
                grouped_patterns=[],
                priority_recommendations=[],
                ci_summary=[],
                status="invalid_json",
                error=content[:500],
            )

        return AIEnhancedSummary(
            provider="openai",
            model=self.config.model,
            enabled=True,
            executive_summary=parsed.get("executive_summary", ""),
            grouped_patterns=parsed.get("grouped_patterns", []),
            priority_recommendations=parsed.get("priority_recommendations", []),
            ci_summary=parsed.get("ci_summary", []),
            status="ok",
            error=None,
        )

    def _build_payload(
        self,
        run_metadata: Dict[str, Any],
        analyses: List[FailedTestAnalysis],
        clusters: List[FailureCluster],
        priority_fixes: List[PriorityFix],
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are a senior SDET and QA automation architect. "
            "Write concise, practical failure analysis summaries. "
            "Do not invent evidence. Prefer concrete root-cause framing and actionable next steps."
        )
        user_payload = {
            "run_metadata": run_metadata,
            "failed_tests": [
                {
                    "title": analysis.identity.title,
                    "file_path": analysis.identity.file_path,
                    "project": analysis.identity.project,
                    "categories": analysis.categories,
                    "probable_root_cause": analysis.probable_root_cause,
                    "confidence": analysis.confidence,
                    "ownership": analysis.ownership,
                    "key_error_lines": analysis.evidence.get("key_error_lines", []),
                    "retry_behavior": analysis.evidence.get("retry_behavior", []),
                }
                for analysis in analyses
            ],
            "clusters": [
                {
                    "name": cluster.name,
                    "likely_root_cause": cluster.likely_root_cause,
                    "affected_tests": cluster.affected_tests,
                    "confidence": cluster.confidence,
                }
                for cluster in clusters[:8]
            ],
            "priority_fixes": [
                {
                    "priority": fix.priority,
                    "title": fix.title,
                    "rationale": fix.rationale,
                    "ownership": fix.ownership,
                }
                for fix in priority_fixes[:8]
            ],
        }
        return {
            "model": self.config.model,
            "input": [
                {
                    "role": "system",
                    "content": [{"type": "input_text", "text": system_prompt}],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": (
                                "Generate an enterprise failure-analysis narrative JSON object with fields: "
                                "executive_summary (string), grouped_patterns (array of strings), "
                                "priority_recommendations (array of strings), ci_summary (array of short strings). "
                                "Base it strictly on this normalized data:\n"
                                f"{json.dumps(user_payload, ensure_ascii=False)}"
                            ),
                        }
                    ],
                },
            ],
            "text": {
                "format": {
                    "type": "json_schema",
                    "name": "failure_analysis_summary",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "properties": {
                            "executive_summary": {"type": "string"},
                            "grouped_patterns": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                            "priority_recommendations": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                            "ci_summary": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                        },
                        "required": [
                            "executive_summary",
                            "grouped_patterns",
                            "priority_recommendations",
                            "ci_summary",
                        ],
                        "additionalProperties": False,
                    },
                }
            },
        }

    def _extract_response_json(self, response: Any) -> str:
        """Extract structured JSON text from an SDK response."""

        output_text = getattr(response, "output_text", None)
        if isinstance(output_text, str) and output_text:
            return output_text

        if hasattr(response, "model_dump"):
            payload = response.model_dump()
            for item in payload.get("output", []):
                for content in item.get("content", []):
                    text = content.get("text")
                    if isinstance(text, str) and text:
                        return text
                    if isinstance(text, dict) and isinstance(text.get("value"), str):
                        return text["value"]
                    if isinstance(content.get("json"), dict):
                        return json.dumps(content["json"])

        raise ValueError("OpenAI response did not include structured text content")
