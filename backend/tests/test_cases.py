from datetime import datetime

from httpx import AsyncClient

from tests.test_triage import DEMO_MESSAGE


async def _triage(client: AsyncClient, headers: dict[str, str], message: str = DEMO_MESSAGE) -> str:
    res = await client.post("/api/v1/triage", json={"message": message}, headers=headers)
    assert res.status_code == 201, res.text
    return str(res.json()["id"])


async def _register(client: AsyncClient, email: str) -> dict[str, str]:
    res = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "a-good-password", "full_name": "Other Student"},
    )
    assert res.status_code == 201, res.text
    return {"Authorization": f"Bearer {res.json()['access_token']}"}


async def test_demo_story(client: AsyncClient, student: dict[str, str]) -> None:
    triage_id = await _triage(client, student)

    res = await client.post(
        "/api/v1/cases",
        json={"triage_id": triage_id, "preferred_contact": "email"},
        headers=student,
    )
    assert res.status_code == 201, res.text
    case = res.json()
    assert case["reference"] == "STU-1001"
    assert case["priority_label"] == "high"
    assert case["assigned_team"] == "Student Wellbeing Services"
    assert case["description"] == DEMO_MESSAGE  # not asked to repeat themselves
    assert [s["state"] for s in case["timeline"]] == ["done", "current", "upcoming", "upcoming"]

    slots = (
        await client.get("/api/v1/appointments/available?category=wellbeing", headers=student)
    ).json()
    assert slots["team_name"] == "Student Wellbeing Services"
    first = slots["slots"][0]

    res = await client.post(
        "/api/v1/appointments",
        json={"case_reference": "STU-1001", "starts_at": first["starts_at"]},
        headers=student,
    )
    assert res.status_code == 201, res.text

    case = (await client.get("/api/v1/cases/STU-1001", headers=student)).json()
    assert case["status"] == "appointment_scheduled"
    assert len(case["appointments"]) == 1
    assert [e["kind"] for e in case["events"]] == ["created", "appointment_scheduled"]

    remaining = (
        await client.get("/api/v1/appointments/available?category=wellbeing", headers=student)
    ).json()["slots"]
    assert first not in remaining

    listing = (await client.get("/api/v1/cases", headers=student)).json()
    assert [c["reference"] for c in listing] == ["STU-1001"]


async def test_one_case_per_triage(client: AsyncClient, student: dict[str, str]) -> None:
    triage_id = await _triage(client, student)
    assert (
        await client.post("/api/v1/cases", json={"triage_id": triage_id}, headers=student)
    ).status_code == 201
    res = await client.post("/api/v1/cases", json={"triage_id": triage_id}, headers=student)
    assert res.status_code == 409
    assert "STU-1001" in res.json()["detail"]


async def test_cases_are_private(client: AsyncClient, student: dict[str, str]) -> None:
    triage_id = await _triage(client, student)
    await client.post("/api/v1/cases", json={"triage_id": triage_id}, headers=student)
    other = await _register(client, "other@example.com")

    assert (await client.get("/api/v1/cases/STU-1001", headers=other)).status_code == 404
    assert (await client.get("/api/v1/cases", headers=other)).json() == []
    # Someone else's triage can't be turned into a case either.
    res = await client.post("/api/v1/cases", json={"triage_id": triage_id}, headers=other)
    assert res.status_code == 404


async def test_cases_require_sign_in(client: AsyncClient) -> None:
    assert (await client.get("/api/v1/cases")).status_code == 401


async def test_rejects_times_that_are_not_slots(
    client: AsyncClient, student: dict[str, str]
) -> None:
    triage_id = await _triage(client, student)
    await client.post("/api/v1/cases", json={"triage_id": triage_id}, headers=student)
    res = await client.post(
        "/api/v1/appointments",
        json={"case_reference": "STU-1001", "starts_at": "2030-01-01T03:17:00+00:00"},
        headers=student,
    )
    assert res.status_code == 422


async def test_slot_cannot_be_double_booked(client: AsyncClient, student: dict[str, str]) -> None:
    for _ in range(2):
        triage_id = await _triage(client, student)
        await client.post("/api/v1/cases", json={"triage_id": triage_id}, headers=student)
    slot = (
        await client.get("/api/v1/appointments/available?category=wellbeing", headers=student)
    ).json()["slots"][0]["starts_at"]

    first = await client.post(
        "/api/v1/appointments",
        json={"case_reference": "STU-1001", "starts_at": slot},
        headers=student,
    )
    assert first.status_code == 201
    # Same instant expressed in another timezone is still the same slot.
    shifted = datetime.fromisoformat(slot).astimezone().isoformat()
    second = await client.post(
        "/api/v1/appointments",
        json={"case_reference": "STU-1002", "starts_at": shifted},
        headers=student,
    )
    assert second.status_code == 409


async def test_anonymous_escalation_can_be_claimed(
    client: AsyncClient, student: dict[str, str]
) -> None:
    body = (await client.post("/api/v1/triage", json={"message": "I want to end my life"})).json()
    reference = body["case_reference"]

    res = await client.post(
        "/api/v1/cases",
        json={"triage_id": body["id"], "preferred_contact": "phone", "contact_detail": "07700"},
        headers=student,
    )
    assert res.status_code == 200, res.text
    case = res.json()
    assert case["reference"] == reference
    assert case["escalated"] is True
    assert case["priority_label"] == "critical"
    assert (await client.get(f"/api/v1/cases/{reference}", headers=student)).status_code == 200
