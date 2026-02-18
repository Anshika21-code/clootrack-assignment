import os
import json
import google.generativeai as genai


ALLOWED_CATEGORIES = {"billing", "technical", "account", "general"}
ALLOWED_PRIORITIES = {"low", "medium", "high", "critical"}

PROMPT = """
You are a support ticket classifier.

Given a user's support ticket description, return ONLY a JSON object:

{
  "suggested_category": "billing|technical|account|general",
  "suggested_priority": "low|medium|high|critical"
}

Rules:
- billing: payments, refunds, invoices, pricing, subscription charges
- technical: bugs, crashes, errors, performance, website/app not working
- account: login, password reset, verification, account access
- general: anything else

Priority:
- critical: system down, security issue, payment deducted but not received, business blocking
- high: cannot login, repeated failure, major feature broken
- medium: partial issue, workaround exists
- low: minor inconvenience, general question

Return ONLY valid JSON. No extra words.
"""


def classify_description(description: str) -> dict:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"suggested_category": "general", "suggested_priority": "low"}

    try:
        genai.configure(api_key=api_key)

        model = genai.GenerativeModel("models/gemini-flash-latest")


        response = model.generate_content(
            [
                PROMPT.strip(),
                f"DESCRIPTION:\n{description.strip()}",
            ]
        )

        raw = response.text.strip()

        # Gemini sometimes wraps output inside ```json ... ```
        raw = raw.replace("```json", "").replace("```", "").strip()

        data = json.loads(raw)

        category = data.get("suggested_category", "general")
        priority = data.get("suggested_priority", "low")

        if category not in ALLOWED_CATEGORIES:
            category = "general"

        if priority not in ALLOWED_PRIORITIES:
            priority = "low"

        return {"suggested_category": category, "suggested_priority": priority}

    except Exception as e:
        print("GEMINI ERROR:", str(e))
        return {"suggested_category": "general", "suggested_priority": "low"}
