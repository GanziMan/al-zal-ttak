from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()  # Google SDK 등이 필요로 하는 환경변수를 os.environ에 로드


class Settings(BaseSettings):
    dart_api_key: str = ""
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    database_url: str = "postgresql+asyncpg://localhost/al_zal_ttak"

    # Kakao OAuth
    kakao_client_id: str = ""
    kakao_client_secret: str = ""
    kakao_redirect_uri: str = ""

    # JWT
    jwt_secret: str = "change-me-in-production"
    jwt_expire_minutes: int = 10080  # 7일

    # Frontend URL (OAuth callback redirect)
    frontend_url: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
