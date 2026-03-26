from sqlalchemy import String, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.models import Base


class Watchlist(Base):
    __tablename__ = "watchlist"
    __table_args__ = (
        Index("ix_watchlist_corp_code", "corp_code"),
    )

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)
    corp_code: Mapped[str] = mapped_column(String, primary_key=True)
    corp_name: Mapped[str] = mapped_column(String, nullable=False)
    stock_code: Mapped[str] = mapped_column(String, nullable=False)
