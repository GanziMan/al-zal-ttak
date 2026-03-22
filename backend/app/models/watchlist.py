from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.models import Base


class Watchlist(Base):
    __tablename__ = "watchlist"

    corp_code: Mapped[str] = mapped_column(String, primary_key=True)
    corp_name: Mapped[str] = mapped_column(String, nullable=False)
    stock_code: Mapped[str] = mapped_column(String, nullable=False)
