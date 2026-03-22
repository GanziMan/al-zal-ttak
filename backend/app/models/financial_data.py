from sqlalchemy import String, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.models import Base


class FinancialData(Base):
    __tablename__ = "financial_data"

    corp_code: Mapped[str] = mapped_column(String, primary_key=True)
    data_type: Mapped[str] = mapped_column(String, primary_key=True)  # financial, dividend, shareholder
    bsns_year: Mapped[str] = mapped_column(String, primary_key=True)
    reprt_code: Mapped[str] = mapped_column(String, primary_key=True)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)
    fetched_at: Mapped[str] = mapped_column(String, nullable=False)
