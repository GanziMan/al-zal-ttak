from sqlalchemy import String, Integer, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.models import Base


class Settings(Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String, primary_key=True, default="default")
    telegram_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    telegram_chat_id: Mapped[str] = mapped_column(String, default="")
    min_importance_score: Mapped[int] = mapped_column(Integer, default=30)
    categories: Mapped[list] = mapped_column(JSON, default=list)
    alert_categories: Mapped[list] = mapped_column(JSON, default=list)
    disclosure_days: Mapped[int] = mapped_column(Integer, default=7)
    alert_keywords: Mapped[list] = mapped_column(JSON, default=list)
