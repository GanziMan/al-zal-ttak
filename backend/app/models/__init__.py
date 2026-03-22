from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.models.watchlist import Watchlist  # noqa: E402, F401
from app.models.bookmark import Bookmark  # noqa: E402, F401
from app.models.settings import Settings  # noqa: E402, F401
from app.models.analysis_cache import AnalysisCache  # noqa: E402, F401
from app.models.user import User  # noqa: E402, F401
