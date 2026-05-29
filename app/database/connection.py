from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from config.settings import settings

Base = declarative_base()


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class Trade(Base):
    """Trade model for tracking trades."""
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True)
    symbol = Column(String(20), nullable=False)
    asset_type = Column(String(20), nullable=False)  # forex or commodity
    action = Column(String(10), nullable=False)  # buy or sell
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=True)
    quantity = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    pnl = Column(Float, nullable=True)
    status = Column(String(20), default="open")  # open, closed, pending
    entry_time = Column(DateTime, default=datetime.utcnow)
    exit_time = Column(DateTime, nullable=True)
    strategy = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)


class Strategy(Base):
    """Strategy model for backtesting."""
    __tablename__ = "strategies"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    parameters = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class Backtest(Base):
    """Backtest results model."""
    __tablename__ = "backtests"
    
    id = Column(Integer, primary_key=True)
    strategy_id = Column(Integer, nullable=True)
    symbol = Column(String(20), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_return = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    win_rate = Column(Float, nullable=True)
    profit_factor = Column(Float, nullable=True)
    total_trades = Column(Integer, nullable=True)
    winning_trades = Column(Integer, nullable=True)
    losing_trades = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    results_data = Column(Text, nullable=True)  # JSON string


class Alert(Base):
    """Alert model for price alerts."""
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True)
    symbol = Column(String(20), nullable=False)
    alert_type = Column(String(20), nullable=False)  # price_above, price_below, indicator
    target_value = Column(Float, nullable=True)
    indicator_name = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    is_triggered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    triggered_at = Column(DateTime, nullable=True)


class PriceHistory(Base):
    """Cached price history data."""
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True)
    symbol = Column(String(20), nullable=False)
    asset_type = Column(String(20), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    open_price = Column(Float, nullable=True)
    high_price = Column(Float, nullable=True)
    low_price = Column(Float, nullable=True)
    close_price = Column(Float, nullable=True)
    volume = Column(Float, nullable=True)


# Database setup
engine = create_engine(settings.DATABASE_URL, echo=settings.DEBUG)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
