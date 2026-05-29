import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""
    
    # App Info
    APP_NAME: str = os.getenv("APP_NAME", "Trading Tool")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # API Keys
    ALPHA_VANTAGE_API_KEY: str = os.getenv("ALPHA_VANTAGE_API_KEY", "")
    
    # MetaTrader 5
    MT5_LOGIN: int = int(os.getenv("MT5_LOGIN", "0")) if os.getenv("MT5_LOGIN") else 0
    MT5_PASSWORD: str = os.getenv("MT5_PASSWORD", "")
    MT5_SERVER: str = os.getenv("MT5_SERVER", "")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///trading.db")
    
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    
    # Dashboard
    DASHBOARD_HOST: str = os.getenv("DASHBOARD_HOST", "0.0.0.0")
    DASHBOARD_PORT: int = int(os.getenv("DASHBOARD_PORT", "8050"))
    
    # API
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # Data Update
    DATA_UPDATE_INTERVAL: int = int(os.getenv("DATA_UPDATE_INTERVAL", "5"))
    
    # Risk Management
    DEFAULT_RISK_PER_TRADE: float = float(os.getenv("DEFAULT_RISK_PER_TRADE", "0.02"))
    DEFAULT_MAX_POSITIONS: int = int(os.getenv("DEFAULT_MAX_POSITIONS", "5"))
    
    # Email Alerts
    EMAIL_ENABLED: bool = os.getenv("EMAIL_ENABLED", "false").lower() == "true"
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "")
    EMAIL_TO: str = os.getenv("EMAIL_TO", "")
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    
    # Telegram Alerts
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "")
    
    # Webhook Alerts
    WEBHOOK_URL: str = os.getenv("WEBHOOK_URL", "")
    
    # Alert Settings
    ALERT_CHECK_INTERVAL: int = int(os.getenv("ALERT_CHECK_INTERVAL", "60"))
    
    # Supported Forex Pairs
    FOREX_PAIRS = [
        "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF",
        "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP",
        "EUR/JPY", "GBP/JPY", "EUR/CHF", "AUD/JPY"
    ]
    
    # Supported Commodities
    COMMODITIES = [
        "GOLD", "SILVER", "CRUDE_OIL_WTI", "CRUDE_OIL_BRENT",
        "NATURAL_GAS", "COPPER", "PLATINUM", "COFFEE",
        "SUGAR", "CORN", "WHEAT", "SOYBEANS"
    ]
    
    @classmethod
    def validate(cls) -> bool:
        """Validate required settings."""
        if not cls.ALPHA_VANTAGE_API_KEY:
            raise ValueError("ALPHA_VANTAGE_API_KEY is required")
        return True


settings = Settings()
