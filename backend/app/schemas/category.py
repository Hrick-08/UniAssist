from pydantic import BaseModel, ConfigDict, Field


class Resource(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    url: str = Field(min_length=1, max_length=500)


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str
    team_name: str
    description: str


class CategoryDetail(CategoryOut):
    guidance: str
    resources: list[Resource]


class CategoryAdmin(CategoryDetail):
    keywords: list[str]


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    team_name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    guidance: str | None = None
    keywords: list[str] | None = None
    resources: list[Resource] | None = None
