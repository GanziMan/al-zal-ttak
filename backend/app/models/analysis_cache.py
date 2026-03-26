from sqlalchemy import String, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.models import Base


class AnalysisCache(Base):
    __tablename__ = "analysis_cache"
    __table_args__ = (
        Index("ix_analysis_cache_rcept_dt", "rcept_dt"),
        Index("ix_analysis_cache_corp_name", "corp_name"),
    )

    rcept_no: Mapped[str] = mapped_column(String, primary_key=True)
    rcept_dt: Mapped[str] = mapped_column(String, default="")
    corp_name: Mapped[str] = mapped_column(String, default="")
    report_nm: Mapped[str] = mapped_column(String, default="")
    analysis: Mapped[dict] = mapped_column(JSON, nullable=False)
