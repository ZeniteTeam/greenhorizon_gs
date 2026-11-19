from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    """Runtime configuration, read from environment variables or backend/Calculations/.env."""

    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", env_file_encoding="utf-8", extra="ignore")

    # Google Earth Engine
    ee_project: str = "powerful-balm-394623"
    # Optional: path to a service-account JSON key registered with Earth Engine.
    # When empty, the credentials saved by `earthengine authenticate` are used.
    ee_service_account_key: str = ""

    # Gemini (leaf diagnosis)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.6-flash"
    # Hard cap on Gemini calls per day (Pacific time, same reset as Google's quota),
    # kept below the free-tier quota so the project never reaches paid usage.
    gemini_daily_limit: int = 200
    # true = leaf diagnosis returns a scripted answer and never calls Gemini (no key needed).
    gemini_mock: bool = True

    # Where the request counter and cached diagnoses are stored.
    data_dir: Path = BASE_DIR / "data"


@lru_cache
def get_settings() -> Settings:
    return Settings()
