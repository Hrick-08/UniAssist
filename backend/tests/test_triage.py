import pytest
from httpx import AsyncClient

from app.models import TriageLevel
from app.scripts.seed import CATEGORIES
from app.services import triage_service
from app.services.triage_service import CategoryRule, analyze
from app.utils.llm_client import LLMError

RULES = [CategoryRule(c["slug"], c["keywords"]) for c in CATEGORIES]

DEMO_MESSAGE = (
    "Exams are approaching, I've been extremely stressed, and I've started missing classes. "
    "But I don't know whether I should contact my faculty, academic office, or wellbeing team."
)


@pytest.mark.parametrize(
    ("message", "level", "category"),
    [
        ("I'm confused about which electives to choose.", 1, "academic"),
        ("How do I apply for a bonafide certificate?", 1, "administrative"),
        ("I'm struggling with my assignments.", 2, "academic"),
        ("I've been struggling with coursework and missing classes.", 2, "academic"),
        ("I can't afford my tuition fees this semester", 2, "financial"),
        ("My roommate plays loud music every night", 2, "accommodation"),
        (
            "I've been feeling extremely overwhelmed and can't keep up with anything.",
            3,
            "wellbeing",
        ),
        ("I've been overwhelmed for weeks and can't attend classes.", 3, "wellbeing"),
        (DEMO_MESSAGE, 3, "wellbeing"),
        ("Someone in my hall keeps harassing me online", 3, "safety"),
        ("I'm in immediate danger.", 4, "safety"),
        ("I don't want to live anymore", 4, "wellbeing"),
        ("He threatened to hurt me if I tell anyone", 4, "safety"),
    ],
)
def test_rules(message: str, level: int, category: str) -> None:
    outcome = analyze(message, RULES)
    assert (outcome.level, outcome.category) == (level, category)


def test_distress_routes_to_wellbeing_with_subject_as_secondary() -> None:
    outcome = analyze(DEMO_MESSAGE, RULES)
    assert outcome.secondary_category == "academic"
    assert {"Stress", "Attendance"} <= set(outcome.topics)
    assert "Difficulty attending classes" in outcome.reasons


def test_unrecognised_message_goes_to_a_human() -> None:
    outcome = analyze("hello?", RULES)
    assert outcome.level == TriageLevel.SUPPORT_RECOMMENDED
    assert outcome.confidence < 0.5


def test_category_hint_breaks_ties() -> None:
    assert analyze("I have a question about my letter", RULES, hint="career").category in (
        "administrative",
        "career",
    )
    assert analyze("I need some help", RULES, hint="career").category == "career"


def test_plural_matching_does_not_match_prefixes() -> None:
    # "fee" must not match "feeling".
    assert analyze("I'm feeling fine, what are the library hours?", RULES).category != "financial"


async def test_guidance_request_needs_no_case(client: AsyncClient) -> None:
    res = await client.post("/api/v1/triage", json={"message": "How do I get a transcript?"})
    assert res.status_code == 201
    body = res.json()
    assert body["level"] == 1
    assert body["action"] == "provide_guidance"
    assert body["case_reference"] is None
    assert body["expected_response"] is None
    assert body["guidance"]["resources"]
    assert body["escalation_contacts"] == []


async def test_priority_result_shape(client: AsyncClient) -> None:
    body = (await client.post("/api/v1/triage", json={"message": DEMO_MESSAGE})).json()
    assert body["level"] == 3
    assert body["priority"] == "high"
    assert body["recommended_team"] == "Student Wellbeing Services"
    assert body["secondary_category"]["slug"] == "academic"
    assert body["expected_response"] == "Within 24 hours"
    assert body["engine"] == "rules"


async def test_safety_escalation_opens_case_immediately(
    client: AsyncClient, staff: dict[str, str]
) -> None:
    res = await client.post("/api/v1/triage", json={"message": "I'm in danger, please help"})
    body = res.json()
    assert body["level"] == 4
    assert body["action"] == "immediate_escalation"
    assert body["escalation_contacts"]
    assert body["guidance"]["resources"] == []
    reference = body["case_reference"]
    assert reference

    queue = (await client.get("/api/v1/admin/queue", headers=staff)).json()
    assert queue["items"][0]["reference"] == reference
    assert queue["items"][0]["escalated"] is True
    assert queue["items"][0]["priority_label"] == "critical"

    again = (await client.get(f"/api/v1/triage/{body['id']}")).json()
    assert again["case_reference"] == reference


async def test_triage_owned_by_student_is_private(
    client: AsyncClient, student: dict[str, str]
) -> None:
    body = (
        await client.post("/api/v1/triage", json={"message": "I'm stressed"}, headers=student)
    ).json()
    assert (await client.get(f"/api/v1/triage/{body['id']}")).status_code == 404
    assert (await client.get(f"/api/v1/triage/{body['id']}", headers=student)).status_code == 200


async def test_invalid_token_is_rejected_even_on_public_endpoint(client: AsyncClient) -> None:
    res = await client.post(
        "/api/v1/triage", json={"message": "hello"}, headers={"Authorization": "Bearer nope"}
    )
    assert res.status_code == 401


class _Cat:
    def __init__(self, slug: str) -> None:
        self.slug, self.name, self.description = slug, slug.title(), ""


CATS = [_Cat(c["slug"]) for c in CATEGORIES]


def _fake_llm(monkeypatch: pytest.MonkeyPatch, reply: dict[str, object] | Exception) -> None:
    async def complete_json(system: str, user: str) -> dict[str, object]:
        if isinstance(reply, Exception):
            raise reply
        return reply

    monkeypatch.setattr(triage_service, "complete_json", complete_json)


async def test_llm_cannot_lower_urgency(monkeypatch: pytest.MonkeyPatch) -> None:
    rules = analyze(DEMO_MESSAGE, RULES)
    _fake_llm(monkeypatch, {"category": "academic", "level": 1, "confidence": 0.9})
    result = await triage_service._llm_refine(DEMO_MESSAGE, CATS, rules)  # type: ignore[arg-type]
    assert result is not None
    assert result.level == TriageLevel.PRIORITY_SUPPORT
    assert result.engine == "llm"


async def test_llm_cannot_reroute_safety_reports(monkeypatch: pytest.MonkeyPatch) -> None:
    message = "Someone in my hall keeps harassing me"
    rules = analyze(message, RULES)
    _fake_llm(monkeypatch, {"category": "accommodation", "level": 2, "confidence": 0.8})
    result = await triage_service._llm_refine(message, CATS, rules)  # type: ignore[arg-type]
    assert result is not None
    assert (result.category, result.secondary_category) == ("safety", "accommodation")


@pytest.mark.parametrize(
    "reply",
    [LLMError("timeout"), {"category": "astrology", "level": 2, "confidence": 0.9}, {"level": 9}],
)
async def test_bad_llm_output_falls_back_to_rules(
    monkeypatch: pytest.MonkeyPatch, reply: dict[str, object] | Exception
) -> None:
    rules = analyze(DEMO_MESSAGE, RULES)
    _fake_llm(monkeypatch, reply)
    assert await triage_service._llm_refine(DEMO_MESSAGE, CATS, rules) is None  # type: ignore[arg-type]
