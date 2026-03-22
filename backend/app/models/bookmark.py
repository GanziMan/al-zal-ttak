from datetime import datetime
from sqlalchemy import String, Text, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models import Base


class Bookmark(Base):
    __tablename__ = "bookmarks"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), primary_key=True)
    rcept_no: Mapped[str] = mapped_column(String, primary_key=True)
    corp_name: Mapped[str] = mapped_column(String, nullable=False)
    report_nm: Mapped[str] = mapped_column(String, nullable=False)
    memo: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
