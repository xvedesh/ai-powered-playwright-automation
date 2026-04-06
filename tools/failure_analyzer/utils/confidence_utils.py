"""Confidence scoring helpers."""

from __future__ import annotations


def confidence_from_scores(primary: float, secondary: float, evidence_count: int) -> str:
    """Estimate confidence from scoring separation and evidence quantity."""

    gap = primary - secondary
    if primary >= 8 and gap >= 3 and evidence_count >= 3:
        return "high"
    if primary >= 5 and gap >= 1:
        return "medium"
    return "low"
