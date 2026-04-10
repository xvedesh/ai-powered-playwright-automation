from __future__ import annotations

import json
import os
from pathlib import Path


class SetupAgent:
    def __init__(self, api_key: str):
        from openai import OpenAI

        self.client = OpenAI(api_key=api_key)
        self.system_prompt = self._load_prompt()
        self.model = os.getenv("AGENT_OPENAI_MODEL") or os.getenv("OPENAI_MODEL") or "gpt-5-mini"

    def _load_prompt(self) -> str:
        prompt_path = Path(__file__).resolve().parent / "prompts" / "setup_prompt.txt"
        return prompt_path.read_text(encoding="utf-8")

    def _run(self, user_content: str) -> str:
        response = self.client.responses.create(
            model=self.model,
            input=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_content},
            ],
        )
        return response.output_text

    def _build_input(self, user_message: str, repo_context: str, env_info: dict, conversation_history: str) -> str:
        return f"""
Current user request:
{user_message}

Conversation history:
{conversation_history}

Environment info:
{json.dumps(env_info, indent=2)}

Retrieved repository context:
{repo_context}
""".strip()

    def decide(self, user_message: str, repo_context: str, env_info: dict, conversation_history: str) -> str:
        return self._run(self._build_input(user_message, repo_context, env_info, conversation_history))

    def continue_after_command(
        self,
        original_user_message: str,
        repo_context: str,
        env_info: dict,
        conversation_history: str,
        command: str,
        command_result: dict,
    ) -> str:
        return self._run(
            f"""
Original user request:
{original_user_message}

Conversation history:
{conversation_history}

Environment info:
{json.dumps(env_info, indent=2)}

Retrieved repository context:
{repo_context}

Executed command:
{command}

Command result:
{json.dumps(command_result, indent=2)}

A command has already been executed.
Analyze the result and decide the next best response.

Rules:
- Return RESPOND if enough information is available
- Return RUN_COMMAND only if exactly one more safe inspection command is needed
- Do not ignore the command result
- Base conclusions only on the command result, environment info, repository context, and conversation history
""".strip()
        )
