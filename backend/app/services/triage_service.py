"""Triage: decide the support area and urgency of a student's message.

Rule-based analysis always runs and is the source of truth for safety: a
Level 4 signal short-circuits everything else. When an LLM is configured it
refines category/topics and may *raise* the urgency level, never lower it.
"""

import logging
import re
import uuid
from collections.abc import Iterable, Sequence
from dataclasses import dataclass, field

from pydantic import BaseModel, Field, ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models import Category, Triage, TriageLevel
from app.utils.llm_client import LLMError, complete_json

logger = logging.getLogger(__name__)

WELLBEING = "wellbeing"
SAFETY = "safety"
FALLBACK_CATEGORY = "administrative"

# Below this, a human reviews the request instead of the student getting self-service only.
_MIN_SELF_SERVICE_CONFIDENCE = 0.5


@dataclass(frozen=True)
class Signal:
    pattern: re.Pattern[str]
    topic: str


def _signals(*pairs: tuple[str, str]) -> tuple[Signal, ...]:
    return tuple(Signal(re.compile(p), topic) for p, topic in pairs)


# Risk to life or immediate danger to the student. Matching is deliberately
# broad: a false escalation costs far less than a missed one.
_SELF_HARM = _signals(
    (r"\bkill(?:ing)? myself\b", "Self-harm risk"),
    (r"\bsuicid\w*", "Self-harm risk"),
    (r"\bend (?:my life|it all)\b", "Self-harm risk"),
    (r"\b(?:want|wanna|going) to die\b", "Self-harm risk"),
    (r"\bself[- ]?harm\w*", "Self-harm risk"),
    (r"\b(?:hurt|hurting|harm|harming|cut|cutting) myself\b", "Self-harm risk"),
    (r"\b(?:no reason|don'?t want|do not want) to (?:live|be alive|be here)\b", "Self-harm risk"),
    (r"\bbetter off (?:dead|without me)\b", "Self-harm risk"),
    (r"\boverdos\w*", "Self-harm risk"),
)
_DANGER = _signals(
    (r"\b(?:in|immediate) danger\b", "Immediate danger"),
    (r"\b(?:i'?m|i am|feel|feeling) (?:not safe|unsafe)\b", "Immediate danger"),
    (r"\bthreat\w* to (?:kill|hurt|harm|attack|beat)\b", "Threat of violence"),
    (r"\b(?:sexually )?assault(?:ed)?\b", "Assault"),
    (r"\brap(?:e|ed)\b", "Assault"),
    (r"\b(?:attacked|hit|beat|beating|punched) me\b", "Violence"),
    (r"\b(?:stalk\w*|being followed)\b", "Stalking"),
    (r"\b(?:gun|knife|weapon)s?\b", "Weapon"),
)
# Acute distress that warrants priority human support on its own.
_SEVERE = _signals(
    (r"\b(?:can'?t|cannot|unable to) cope\b", "Difficulty coping"),
    (r"\bcan'?t keep up with anything\b", "Difficulty coping"),
    (r"\b(?:falling apart|breaking down|break ?down)\b", "Difficulty coping"),
    (r"\bpanic attacks?\b", "Panic"),
    (r"\b(?:hopeless|worthless)\b", "Hopelessness"),
    (r"\bcan'?t stop crying\b", "Distress"),
    (r"\bcan'?t (?:function|get out of bed)\b", "Difficulty coping"),
)
_DISTRESS = _signals(
    (r"\bstress(?:ed|ful)?\b", "Stress"),
    (r"\boverwhelm(?:ed|ing)?\b", "Feeling overwhelmed"),
    (r"\b(?:anxious|anxiety|panick?(?:ing|ed)?)\b", "Anxiety"),
    (r"\b(?:burn(?:ed|t)[- ]?out|burnout|exhausted)\b", "Burnout"),
    (r"\b(?:lonely|loneliness|isolated)\b", "Loneliness"),
    (r"\b(?:depressed|low mood|sad all the time)\b", "Low mood"),
)
_IMPACT = _signals(
    (
        r"\b(?:miss(?:ing|ed)|skipp(?:ing|ed)) (?:my )?"
        r"(?:class(?:es)?|lectures?|lessons?|seminars?)\b",
        "Attendance",
    ),
    (
        r"\b(?:can'?t|cannot|not|stopped) (?:attend\w*|going to (?:class|classes|lectures))\b",
        "Attendance",
    ),
    (r"\b(?:failing|failed)\b", "Grades"),
    (r"\b(?:can'?t|cannot) (?:focus|concentrate)\b", "Concentration"),
    (r"\b(?:can'?t|cannot|haven'?t been able to) sleep\b|\bnot sleeping\b", "Sleep"),
    (r"\b(?:can'?t|cannot) keep up\b|\bfalling behind\b", "Falling behind"),
    (r"\bnot eating\b", "Eating"),
)
_PERSISTENT = re.compile(
    r"\bfor (?:weeks|months|a long time|ages)\b|\b(?:every day|all the time|constantly)\b"
)
_INTENSIFIER = re.compile(r"\b(?:extremely|incredibly|really|very|completely|totally|severely)\b")
_HELP_SEEKING = re.compile(
    r"\b(?:struggl\w*|need (?:help|support|someone)|can'?t afford|worried|problem|issue|"
    r"complain\w*|conflict|unfair|broken|not working|difficult\w*|dispute)\b"
)
_INFORMATIONAL = re.compile(
    r"^(?:how|where|when|what|which|who|can i|is there|do i|are there)\b|"
    r"\b(?:how (?:do|can|to)|where (?:do|can|is)|which|deadline|apply for|information about|"
    r"not sure|confused about|wondering|want to know)\b"
)


@dataclass(frozen=True)
class CategoryRule:
    slug: str
    keywords: Sequence[str]


@dataclass
class TriageOutcome:
    level: TriageLevel
    category: str
    secondary_category: str | None
    topics: list[str]
    reasons: list[str]
    confidence: float
    engine: str = "rules"


@dataclass
class _Findings:
    self_harm: list[str] = field(default_factory=list)
    danger: list[str] = field(default_factory=list)
    severe: list[str] = field(default_factory=list)
    distress: list[str] = field(default_factory=list)
    impact: list[str] = field(default_factory=list)


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace("’", "'").lower()).strip()


def _match_all(signals: Iterable[Signal], text: str) -> list[str]:
    return [s.topic for s in signals if s.pattern.search(text)]


def _keyword_pattern(keyword: str) -> re.Pattern[str]:
    # Allow simple plurals ("exam" → "exams") without prefix matches ("fee" ≠ "feel").
    return re.compile(rf"\b{re.escape(keyword.lower())}(?:s|es)?\b")


def _dedupe(items: Iterable[str]) -> list[str]:
    return list(dict.fromkeys(items))


def analyze(
    message: str, categories: Sequence[CategoryRule], hint: str | None = None
) -> TriageOutcome:
    """Pure rule-based triage of a student's message."""
    text = _normalize(message)
    known = {c.slug for c in categories}
    found = _Findings(
        self_harm=_match_all(_SELF_HARM, text),
        danger=_match_all(_DANGER, text),
        severe=_match_all(_SEVERE, text),
        distress=_match_all(_DISTRESS, text),
        impact=_match_all(_IMPACT, text),
    )

    scores: dict[str, int] = {}
    keyword_topics: list[str] = []
    for category in categories:
        hits = [kw for kw in category.keywords if _keyword_pattern(kw).search(text)]
        if hits:
            # Multi-word phrases are stronger evidence than single words.
            scores[category.slug] = sum(len(kw.split()) for kw in hits)
            keyword_topics.extend(kw.upper() if len(kw) <= 3 else kw.capitalize() for kw in hits)
    if WELLBEING in known and (found.distress or found.severe):
        scores[WELLBEING] = scores.get(WELLBEING, 0) + len(found.distress) + len(found.severe)
    if hint in known:
        scores[hint] = scores.get(hint, 0) + 1

    ranked = sorted(scores, key=lambda slug: scores[slug], reverse=True)

    if found.self_harm or found.danger:
        primary = WELLBEING if found.self_harm and not found.danger else SAFETY
        primary = primary if primary in known else (ranked[0] if ranked else FALLBACK_CATEGORY)
        escalation_reasons = []
        if found.self_harm:
            escalation_reasons.append("Possible risk to the student's safety")
        if found.danger:
            escalation_reasons.append("Possible immediate danger or violence reported")
        escalation_reasons.append("Immediate human help needed")
        return TriageOutcome(
            level=TriageLevel.SAFETY_ESCALATION,
            category=primary,
            secondary_category=next((s for s in ranked if s != primary), None),
            topics=_dedupe([*found.self_harm, *found.danger, *found.severe, *found.distress]),
            reasons=escalation_reasons,
            confidence=0.95,
        )

    reasons: list[str] = []
    persistent = bool(_PERSISTENT.search(text))
    intensified = bool(_INTENSIFIER.search(text))
    acute_distress = bool(found.severe) or (
        bool(found.distress) and (bool(found.impact) or (persistent and intensified))
    )

    if acute_distress:
        level = TriageLevel.PRIORITY_SUPPORT
        reasons.append("Significant distress described")
    elif found.distress or found.impact or _HELP_SEEKING.search(text):
        level = TriageLevel.SUPPORT_RECOMMENDED
    elif _INFORMATIONAL.search(text) or text.endswith("?"):
        level = TriageLevel.GENERAL_GUIDANCE
    else:
        # A described situation with no clear signals: let a person look at it.
        level = TriageLevel.SUPPORT_RECOMMENDED

    if "Stress" in found.distress:
        reasons.append("Stress-related concern detected")
    elif found.distress:
        reasons.append("Wellbeing concern detected")
    if "Attendance" in found.impact:
        reasons.append("Difficulty attending classes")
    elif found.impact:
        reasons.append("Concern is affecting day-to-day studies")
    if persistent:
        reasons.append("Ongoing for some time")

    # Route on the student's need, not keyword counts: a safety report always
    # leads, and when distress drives urgency wellbeing leads; the subject area
    # (e.g. academic) becomes the secondary team.
    if SAFETY in scores:
        primary = SAFETY
    elif acute_distress and WELLBEING in known:
        primary = WELLBEING
    elif ranked:
        primary = ranked[0]
    else:
        primary = FALLBACK_CATEGORY if FALLBACK_CATEGORY in known else categories[0].slug
    secondary = next((s for s in ranked if s != primary), None)

    if primary == SAFETY and level < TriageLevel.PRIORITY_SUPPORT:
        # Bullying, harassment and discrimination are never routine tickets.
        level = TriageLevel.PRIORITY_SUPPORT
        reasons.append("Safety or harassment concern reported")

    if acute_distress and primary == WELLBEING:
        # Routing here is rule-driven, not a keyword race, so score the distress evidence.
        evidence = len(found.severe) + len(found.distress) + len(found.impact)
        confidence = 0.7 + 0.05 * evidence
    elif not ranked:
        confidence = 0.35
        reasons.append("No specific support area recognised; a staff member will review")
    else:
        top = scores[primary]
        confidence = 0.6 + 0.1 * min(top, 3)
        if primary != SAFETY and secondary is not None and scores[secondary] >= top:
            confidence -= 0.15
    confidence = round(min(confidence, 0.95), 2)

    if level == TriageLevel.GENERAL_GUIDANCE and confidence < _MIN_SELF_SERVICE_CONFIDENCE:
        level = TriageLevel.SUPPORT_RECOMMENDED
    if level >= TriageLevel.SUPPORT_RECOMMENDED:
        reasons.append("Human support recommended")

    return TriageOutcome(
        level=level,
        category=primary,
        secondary_category=secondary,
        topics=_dedupe([*found.severe, *found.distress, *found.impact, *keyword_topics]),
        reasons=_dedupe(reasons),
        confidence=confidence,
    )


class _LLMTriage(BaseModel):
    category: str
    secondary_category: str | None = None
    level: int = Field(ge=1, le=3)
    topics: list[str] = Field(default_factory=list)
    reasons: list[str] = Field(default_factory=list)
    confidence: float = Field(ge=0, le=1)


_LLM_SYSTEM_PROMPT = """\
You triage messages from university students to the right support team.
Never diagnose medical or mental-health conditions; describe needs, not disorders.

Return a JSON object with:
- "category": one slug from the list below (the team best placed to help)
- "secondary_category": another slug if a second team should be involved, else null
- "level": 1 = answerable with information/resources, 2 = human support recommended,
  3 = timely human support needed (significant distress or serious impact on studies)
- "topics": up to 5 short topic labels (e.g. "Exam stress", "Attendance")
- "reasons": up to 4 short, student-facing reasons for the decision
- "confidence": 0 to 1

Categories:
{categories}"""


async def _llm_refine(
    message: str, categories: Sequence[Category], rules: TriageOutcome
) -> TriageOutcome | None:
    listing = "\n".join(f"- {c.slug}: {c.name} ({c.description})" for c in categories)
    try:
        raw = await complete_json(_LLM_SYSTEM_PROMPT.format(categories=listing), message)
        result = _LLMTriage.model_validate(raw)
    except (LLMError, ValidationError) as exc:
        logger.warning("LLM triage failed, using rule-based result: %s", exc)
        return None

    known = {c.slug for c in categories}
    if result.category not in known:
        logger.warning("LLM returned unknown category %r", result.category)
        return None
    # Like urgency, a rule-detected safety report keeps its lead team.
    secondary: str | None
    if rules.category == SAFETY and result.category != SAFETY:
        category, secondary = SAFETY, result.category
    else:
        category, secondary = result.category, result.secondary_category
    if secondary not in known or secondary == category:
        secondary = None

    level = max(rules.level, TriageLevel(result.level))
    reasons = result.reasons[:4] or rules.reasons
    if level >= TriageLevel.SUPPORT_RECOMMENDED and "Human support recommended" not in reasons:
        reasons = [*reasons, "Human support recommended"]
    return TriageOutcome(
        level=level,
        category=category,
        secondary_category=secondary,
        topics=_dedupe(result.topics)[:5] or rules.topics,
        reasons=reasons,
        confidence=round(result.confidence, 2),
        engine="llm",
    )


async def run_triage(
    session: AsyncSession, message: str, hint: str | None, user_id: uuid.UUID | None
) -> Triage:
    categories = list((await session.scalars(select(Category).order_by(Category.id))).all())
    if not categories:
        raise RuntimeError("No categories configured; run the seed script")
    by_slug = {c.slug: c for c in categories}

    outcome = analyze(message, [CategoryRule(c.slug, c.keywords) for c in categories], hint)
    if get_settings().llm_enabled and outcome.level < TriageLevel.SAFETY_ESCALATION:
        outcome = await _llm_refine(message, categories, outcome) or outcome

    triage = Triage(
        user_id=user_id,
        message=message,
        category_id=by_slug[outcome.category].id,
        secondary_category_id=(
            by_slug[outcome.secondary_category].id if outcome.secondary_category else None
        ),
        level=int(outcome.level),
        topics=outcome.topics,
        reasons=outcome.reasons,
        confidence=outcome.confidence,
        engine=outcome.engine,
    )
    session.add(triage)
    await session.flush()
    await session.refresh(triage, ["category", "secondary_category"])
    return triage
