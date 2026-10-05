from httpx import AsyncClient

from tests.test_cases import _triage


async def _open_case(client: AsyncClient, student: dict[str, str], message: str) -> str:
    triage_id = await _triage(client, student, message)
    res = await client.post("/api/v1/cases", json={"triage_id": triage_id}, headers=student)
    assert res.status_code == 201, res.text
    return str(res.json()["reference"])


async def _me(client: AsyncClient, headers: dict[str, str]) -> str:
    return str((await client.get("/api/v1/auth/me", headers=headers)).json()["id"])


async def test_students_cannot_use_admin(client: AsyncClient, student: dict[str, str]) -> None:
    assert (await client.get("/api/v1/admin/queue", headers=student)).status_code == 403
    assert (await client.get("/api/v1/admin/dashboard")).status_code == 401


async def test_queue_orders_and_filters(
    client: AsyncClient, student: dict[str, str], staff: dict[str, str]
) -> None:
    low = await _open_case(client, student, "My hostel wifi is broken")
    high = await _open_case(client, student, "I'm extremely stressed and missing lectures")

    items = (await client.get("/api/v1/admin/queue", headers=staff)).json()["items"]
    assert [i["reference"] for i in items] == [high, low]

    high_only = (await client.get("/api/v1/admin/queue?min_priority=3", headers=staff)).json()
    assert [i["reference"] for i in high_only["items"]] == [high]
    assert high_only["total"] == 1

    by_category = (
        await client.get("/api/v1/admin/queue?category=accommodation", headers=staff)
    ).json()
    assert [i["reference"] for i in by_category["items"]] == [low]


async def test_case_handling(
    client: AsyncClient, student: dict[str, str], staff: dict[str, str]
) -> None:
    ref = await _open_case(client, student, "I'm extremely stressed and missing lectures")
    staff_id = await _me(client, staff)

    res = await client.patch(
        f"/api/v1/admin/cases/{ref}",
        json={"assigned_to_id": staff_id, "note": "Called student, no answer", "priority": 4},
        headers=staff,
    )
    assert res.status_code == 200, res.text
    detail = res.json()
    assert detail["status"] == "assigned"
    assert detail["priority_label"] == "critical"
    assert detail["assigned_to"]["id"] == staff_id
    assert detail["first_response_at"] is not None
    assert detail["triage"]["topics"]
    assert {e["kind"] for e in detail["events"]} >= {"assigned", "note", "priority_changed"}

    # Internal notes and priority changes stay internal.
    student_view = (await client.get(f"/api/v1/cases/{ref}", headers=student)).json()
    kinds = [e["kind"] for e in student_view["events"]]
    assert "note" not in kinds and "priority_changed" not in kinds
    assert "assigned" in kinds

    slot = (
        await client.get("/api/v1/appointments/available?category=wellbeing", headers=staff)
    ).json()["slots"][0]["starts_at"]
    res = await client.post(
        f"/api/v1/admin/cases/{ref}/appointments", json={"starts_at": slot}, headers=staff
    )
    assert res.status_code == 201

    res = await client.patch(
        f"/api/v1/admin/cases/{ref}", json={"status": "resolved"}, headers=staff
    )
    detail = res.json()
    assert detail["resolved_at"] is not None
    assert all(s["state"] == "done" for s in detail["timeline"])

    open_queue = (await client.get("/api/v1/admin/queue", headers=staff)).json()
    assert open_queue["total"] == 0


async def test_assign_only_to_staff(
    client: AsyncClient, student: dict[str, str], staff: dict[str, str]
) -> None:
    ref = await _open_case(client, student, "I need help with my CV")
    res = await client.patch(
        f"/api/v1/admin/cases/{ref}",
        json={"assigned_to_id": await _me(client, student)},
        headers=staff,
    )
    assert res.status_code == 422


async def test_team_reassignment(
    client: AsyncClient, student: dict[str, str], staff: dict[str, str]
) -> None:
    ref = await _open_case(client, student, "I need help with my CV")
    res = await client.patch(
        f"/api/v1/admin/cases/{ref}", json={"category": "academic"}, headers=staff
    )
    assert res.json()["assigned_team"] == "Academic Services"


async def test_dashboard_and_analytics(
    client: AsyncClient, student: dict[str, str], staff: dict[str, str]
) -> None:
    await client.post("/api/v1/triage", json={"message": "How do I get a transcript?"})
    await client.post("/api/v1/triage", json={"message": "I am in danger"})
    await _open_case(client, student, "I'm extremely stressed and missing lectures")

    stats = (await client.get("/api/v1/admin/dashboard", headers=staff)).json()
    assert stats["total_requests"] == 3
    assert stats["self_service_resolved"] == 1
    assert stats["total_cases"] == 2
    assert stats["high_priority_open"] == 2
    assert stats["escalations_open"] == 1
    assert stats["unassigned_open"] == 2

    data = (await client.get("/api/v1/admin/analytics?days=7", headers=staff)).json()
    assert sum(d["total"] for d in data["requests_by_day"]) == 3
    assert data["by_category"]["wellbeing"] == 1
    assert data["by_level"] == {"1": 1, "3": 1, "4": 1}
    assert any(t["topic"] == "Stress" for t in data["top_topics"])
    assert {t["team_name"] for t in data["response_by_team"]} >= {"Student Wellbeing Services"}


async def test_category_admin(
    client: AsyncClient, staff: dict[str, str], admin: dict[str, str]
) -> None:
    body = {"keywords": ["Visa", "  biometric permit "]}
    assert (
        await client.patch("/api/v1/categories/administrative", json=body, headers=staff)
    ).status_code == 403
    res = await client.patch("/api/v1/categories/administrative", json=body, headers=admin)
    assert res.json()["keywords"] == ["biometric permit", "visa"]

    triage = (
        await client.post("/api/v1/triage", json={"message": "Where is my biometric permit?"})
    ).json()
    assert triage["category"]["slug"] == "administrative"
