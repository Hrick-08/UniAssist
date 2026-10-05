"""Seed categories and demo accounts. Idempotent: safe to run on every deploy.

python -m app.scripts.seed            # categories only
python -m app.scripts.seed --demo     # plus demo admin/staff/student accounts
"""

import argparse
import asyncio
from functools import cache
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models import Category, Role, User

CATEGORIES: list[dict[str, Any]] = [
    {
        "slug": "academic",
        "name": "Academic",
        "team_name": "Academic Services",
        "description": "Coursework, grades, exams, attendance and faculty issues.",
        "guidance": "Your academic advisor can help you plan modules, deadlines and study support.",
        "keywords": [
            "academic",
            "coursework",
            "assignment",
            "exam",
            "grade",
            "marks",
            "module",
            "elective",
            "lecture",
            "class",
            "subject",
            "faculty",
            "professor",
            "lecturer",
            "deadline",
            "extension",
            "dissertation",
            "thesis",
            "study",
            "attendance",
            "tutor",
            "plagiarism",
            "resit",
        ],
        "resources": [
            {"title": "Choosing your modules and electives", "url": "/resources/electives"},
            {"title": "Requesting an assignment extension", "url": "/resources/extensions"},
            {"title": "Study skills workshops", "url": "/resources/study-skills"},
        ],
    },
    {
        "slug": "financial",
        "name": "Financial",
        "team_name": "Financial Aid",
        "description": "Fees, scholarships, bursaries and financial hardship.",
        "guidance": "Financial Aid can explain payment options, scholarships and hardship funds.",
        "keywords": [
            "fee",
            "tuition",
            "scholarship",
            "bursary",
            "loan",
            "money",
            "rent",
            "payment",
            "afford",
            "financial",
            "funding",
            "hardship",
            "debt",
            "refund",
        ],
        "resources": [
            {"title": "Scholarships and bursaries", "url": "/resources/scholarships"},
            {"title": "Fee payment plans", "url": "/resources/payment-plans"},
            {"title": "Emergency hardship fund", "url": "/resources/hardship-fund"},
        ],
    },
    {
        "slug": "wellbeing",
        "name": "Wellbeing",
        "team_name": "Student Wellbeing Services",
        "description": "Stress, feeling overwhelmed, loneliness, burnout and coping.",
        "guidance": "Student Wellbeing Services offers confidential support and drop-in sessions.",
        "keywords": [
            "wellbeing",
            "mental health",
            "counselling",
            "counselor",
            "counsellor",
            "therapy",
            "coping",
            "mood",
            "emotional",
            "sleep",
        ],
        "resources": [
            {"title": "Managing exam stress", "url": "/resources/exam-stress"},
            {"title": "Wellbeing drop-in sessions", "url": "/resources/wellbeing-drop-in"},
            {"title": "Peer support groups", "url": "/resources/peer-support"},
        ],
    },
    {
        "slug": "accommodation",
        "name": "Accommodation",
        "team_name": "Accommodation & Campus Life",
        "description": "Halls, hostels, roommates, food, transport and campus facilities.",
        "guidance": "The Accommodation team handles room issues, maintenance and housing moves.",
        "keywords": [
            "accommodation",
            "hostel",
            "hall",
            "dorm",
            "room",
            "roommate",
            "flatmate",
            "housing",
            "landlord",
            "maintenance",
            "mess",
            "canteen",
            "food",
            "transport",
            "bus",
            "parking",
            "facilities",
            "wifi",
            "noise",
        ],
        "resources": [
            {"title": "Reporting a maintenance issue", "url": "/resources/maintenance"},
            {"title": "Requesting a room change", "url": "/resources/room-change"},
            {"title": "Campus transport", "url": "/resources/transport"},
        ],
    },
    {
        "slug": "safety",
        "name": "Safety",
        "team_name": "Safety & Student Protection",
        "description": "Bullying, harassment, discrimination, threats and unsafe situations.",
        "guidance": "The Student Protection team handles reports confidentially and urgently.",
        "keywords": [
            "bully",
            "bullies",
            "bullying",
            "bullied",
            "harass",
            "harasses",
            "harassing",
            "harassment",
            "harassed",
            "discrimination",
            "discriminated",
            "discriminating",
            "racism",
            "racist",
            "sexism",
            "sexist",
            "homophobic",
            "transphobic",
            "threat",
            "threatens",
            "threatened",
            "threatening",
            "abuse",
            "abused",
            "abusing",
            "abusive",
            "unsafe",
            "safety",
            "intimidated",
            "intimidating",
            "spiking",
            "spiked",
            "groping",
            "groped",
        ],
        "resources": [
            {"title": "Report and Support (anonymous option)", "url": "/resources/report"},
            {
                "title": "Your rights and how reports are handled",
                "url": "/resources/reporting-policy",
            },
        ],
    },
    {
        "slug": "career",
        "name": "Career",
        "team_name": "Career Services",
        "description": "Internships, placements, CVs and career direction.",
        "guidance": "Career Services runs CV reviews, mock interviews and placement advice.",
        "keywords": [
            "career",
            "internship",
            "placement",
            "job",
            "resume",
            "cv",
            "interview",
            "graduate scheme",
            "employment",
            "linkedin",
            "skills",
        ],
        "resources": [
            {"title": "CV and cover letter guide", "url": "/resources/cv-guide"},
            {"title": "Book a mock interview", "url": "/resources/mock-interview"},
            {"title": "Internship listings", "url": "/resources/internships"},
        ],
    },
    {
        "slug": "social",
        "name": "Social",
        "team_name": "Student Support",
        "description": "Relationships, family difficulties, friendships and peer conflict.",
        "guidance": "Student Support can talk through personal and family situations with you.",
        "keywords": [
            "relationship",
            "boyfriend",
            "girlfriend",
            "partner",
            "breakup",
            "break up",
            "family",
            "parent",
            "friend",
            "friendship",
            "peer",
            "argument",
            "fitting in",
            "homesick",
            "homesickness",
            "no friends",
        ],
        "resources": [
            {"title": "Clubs and societies", "url": "/resources/societies"},
            {"title": "Dealing with homesickness", "url": "/resources/homesickness"},
        ],
    },
    {
        "slug": "administrative",
        "name": "Administrative",
        "team_name": "Student Administration",
        "description": "ID cards, documents, registration, certificates and procedures.",
        "guidance": "Student Administration handles records, letters and registration.",
        "keywords": [
            "id card",
            "student card",
            "document",
            "certificate",
            "bonafide",
            "transcript",
            "registration",
            "register",
            "enrolment",
            "enrollment",
            "letter",
            "visa",
            "records",
            "graduation",
            "name change",
        ],
        "resources": [
            {"title": "Requesting certificates and letters", "url": "/resources/certificates"},
            {"title": "Replacing a lost ID card", "url": "/resources/id-card"},
            {"title": "Registration and enrolment", "url": "/resources/registration"},
        ],
    },
]

DEMO_PASSWORD = "uniroute-demo"
DEMO_USERS: list[dict[str, Any]] = [
    {"email": "admin@uniroute.dev", "full_name": "Ada Admin", "role": Role.ADMIN},
    {
        "email": "wellbeing@uniroute.dev",
        "full_name": "Sam Rivera",
        "role": Role.STAFF,
        "team": "wellbeing",
    },
    {
        "email": "academic@uniroute.dev",
        "full_name": "Priya Shah",
        "role": Role.STAFF,
        "team": "academic",
    },
    {
        "email": "student@uniroute.dev",
        "full_name": "Tanveer Ahmed",
        "role": Role.STUDENT,
        "student_number": "S1234567",
    },
]


@cache
def _demo_password_hash() -> str:
    # bcrypt is deliberately slow; hash the shared demo password once per process.
    return hash_password(DEMO_PASSWORD)


async def seed_categories(session: AsyncSession) -> dict[str, Category]:
    existing = {c.slug: c for c in (await session.scalars(select(Category))).all()}
    for data in CATEGORIES:
        category = existing.get(data["slug"])
        if category is None:
            category = Category(**data)
            session.add(category)
            existing[data["slug"]] = category
        else:
            # Keep admin edits to names/guidance; only refresh triage keywords.
            category.keywords = sorted(set(category.keywords) | set(data["keywords"]))
    await session.flush()
    return existing


async def seed_demo_users(session: AsyncSession, categories: dict[str, Category]) -> None:
    emails = set((await session.scalars(select(User.email))).all())
    for data in DEMO_USERS:
        if data["email"] in emails:
            continue
        team = data.get("team")
        session.add(
            User(
                email=data["email"],
                full_name=data["full_name"],
                role=data["role"],
                student_number=data.get("student_number"),
                category_id=categories[team].id if team else None,
                hashed_password=_demo_password_hash(),
            )
        )


async def main(demo: bool) -> None:
    async with SessionLocal() as session:
        categories = await seed_categories(session)
        if demo:
            await seed_demo_users(session, categories)
        await session.commit()
    await engine.dispose()
    print(f"Seeded {len(CATEGORIES)} categories" + (" and demo users" if demo else ""))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--demo", action="store_true", help="also create demo accounts")
    asyncio.run(main(parser.parse_args().demo))
