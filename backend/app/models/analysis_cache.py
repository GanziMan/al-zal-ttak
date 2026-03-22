from sqlalchemy import String, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.models import Base


class AnalysisCache(Base):
    __tablename__ = "analysis_cache"

    rcept_no: Mapped[str] = mapped_column(String, primary_key=True)
    rcept_dt: Mapped[str] = mapped_column(String, default="")
    corp_name: Mapped[str] = mapped_column(String, default="")
    report_nm: Mapped[str] = mapped_column(String, default="")
    analysis: Mapped[dict] = mapped_column(JSON, nullable=False)
