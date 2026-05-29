import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

from app.services.analysis_service import analysis_service
from config.settings import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AlertType(Enum):
    """Types of alerts."""
    PRICE_ABOVE = "price_above"
    PRICE_BELOW = "price_below"
    RSI_OVERSOLD = "rsi_oversold"
    RSI_OVERBOUGHT = "rsi_overboought"
    MACD_CROSSOVER = "macd_crossover"
    SIGNAL_GENERATED = "signal_generated"
    BREAKOUT = "breakout"
    BREAKDOWN = "breakdown"


class AlertChannel(Enum):
    """Alert notification channels."""
    EMAIL = "email"
    TELEGRAM = "telegram"
    WEBHOOK = "webhook"
    DASHBOARD = "dashboard"


@dataclass
class AlertCondition:
    """Alert condition configuration."""
    symbol: str
    asset_type: str
    alert_type: AlertType
    threshold: Optional[float] = None
    confidence_min: float = 60.0
    enabled: bool = True
    channels: List[AlertChannel] = None
    
    def __post_init__(self):
        if self.channels is None:
            self.channels = [AlertChannel.DASHBOARD]


@dataclass
class Alert:
    """Alert instance."""
    id: str
    condition: AlertCondition
    timestamp: datetime
    message: str
    data: Dict
    sent: bool = False
    sent_channels: List[AlertChannel] = None


class AlertService:
    """Service for monitoring markets and sending alerts."""
    
    def __init__(self):
        self.active_conditions: List[AlertCondition] = []
        self.alert_history: List[Alert] = []
        self.last_signals: Dict[str, Dict] = {}
        self.running = False
        
    def add_alert_condition(
        self,
        symbol: str,
        asset_type: str,
        alert_type: AlertType,
        threshold: Optional[float] = None,
        confidence_min: float = 60.0,
        channels: List[AlertChannel] = None
    ) -> AlertCondition:
        """Add a new alert condition."""
        condition = AlertCondition(
            symbol=symbol,
            asset_type=asset_type,
            alert_type=alert_type,
            threshold=threshold,
            confidence_min=confidence_min,
            channels=channels or [AlertChannel.DASHBOARD]
        )
        self.active_conditions.append(condition)
        logger.info(f"Added alert condition: {symbol} - {alert_type.value}")
        return condition
    
    def remove_alert_condition(self, condition_id: str) -> bool:
        """Remove an alert condition."""
        for i, condition in enumerate(self.active_conditions):
            if id(condition) == int(condition_id):
                self.active_conditions.pop(i)
                logger.info(f"Removed alert condition: {condition.symbol}")
                return True
        return False
    
    def check_price_conditions(self, symbol: str, asset_type: str, current_price: float) -> List[Alert]:
        """Check price-based alert conditions."""
        alerts = []
        
        for condition in self.active_conditions:
            if condition.symbol != symbol or condition.asset_type != asset_type:
                continue
            
            if not condition.enabled:
                continue
            
            if condition.alert_type == AlertType.PRICE_ABOVE:
                if condition.threshold and current_price > condition.threshold:
                    alert = self._create_alert(
                        condition,
                        f"{symbol} price above {condition.threshold}",
                        {"current_price": current_price, "threshold": condition.threshold}
                    )
                    alerts.append(alert)
            
            elif condition.alert_type == AlertType.PRICE_BELOW:
                if condition.threshold and current_price < condition.threshold:
                    alert = self._create_alert(
                        condition,
                        f"{symbol} price below {condition.threshold}",
                        {"current_price": current_price, "threshold": condition.threshold}
                    )
                    alerts.append(alert)
        
        return alerts
    
    def check_indicator_conditions(self, symbol: str, asset_type: str, analysis: Dict) -> List[Alert]:
        """Check indicator-based alert conditions."""
        alerts = []
        indicators = analysis.get('indicators', {})
        
        for condition in self.active_conditions:
            if condition.symbol != symbol or condition.asset_type != asset_type:
                continue
            
            if not condition.enabled:
                continue
            
            # RSI conditions
            if condition.alert_type == AlertType.RSI_OVERSOLD:
                rsi = indicators.get('rsi', 50)
                if rsi < 30:
                    alert = self._create_alert(
                        condition,
                        f"{symbol} RSI Oversold ({rsi:.2f})",
                        {"rsi": rsi, "signal": "BUY"}
                    )
                    alerts.append(alert)
            
            elif condition.alert_type == AlertType.RSI_OVERBOUGHT:
                rsi = indicators.get('rsi', 50)
                if rsi > 70:
                    alert = self._create_alert(
                        condition,
                        f"{symbol} RSI Overbought ({rsi:.2f})",
                        {"rsi": rsi, "signal": "SELL"}
                    )
                    alerts.append(alert)
            
            # MACD crossover
            elif condition.alert_type == AlertType.MACD_CROSSOVER:
                macd = indicators.get('macd', 0)
                macd_signal = indicators.get('macd_signal', 0)
                macd_hist = indicators.get('macd_histogram', 0)
                
                # Check if crossover happened
                if macd > macd_signal and macd_hist > 0:
                    alert = self._create_alert(
                        condition,
                        f"{symbol} MACD Bullish Crossover",
                        {"macd": macd, "signal": "BUY"}
                    )
                    alerts.append(alert)
                elif macd < macd_signal and macd_hist < 0:
                    alert = self._create_alert(
                        condition,
                        f"{symbol} MACD Bearish Crossover",
                        {"macd": macd, "signal": "SELL"}
                    )
                    alerts.append(alert)
        
        return alerts
    
    def check_signal_conditions(self, symbol: str, asset_type: str, analysis: Dict) -> List[Alert]:
        """Check signal-based alert conditions."""
        alerts = []
        
        for condition in self.active_conditions:
            if condition.symbol != symbol or condition.asset_type != asset_type:
                continue
            
            if not condition.enabled:
                continue
            
            if condition.alert_type == AlertType.SIGNAL_GENERATED:
                signal = analysis.get('signal')
                confidence = analysis.get('confidence', 0)
                
                if confidence >= condition.confidence_min and signal in ['BUY', 'SELL']:
                    alert = self._create_alert(
                        condition,
                        f"{symbol} {signal} Signal Generated (Confidence: {confidence:.1f}%)",
                        {
                            "signal": signal,
                            "confidence": confidence,
                            "coordinates": analysis.get('coordinates'),
                            "risk_reward": analysis.get('risk_reward_ratio')
                        }
                    )
                    alerts.append(alert)
            
            # Breakout/Breakdown
            elif condition.alert_type == AlertType.BREAKOUT:
                resistance = analysis.get('resistance_levels', [])
                current_price = analysis.get('current_price', 0)
                
                if resistance and current_price > resistance[0]:
                    alert = self._create_alert(
                        condition,
                        f"{symbol} Breakout above resistance",
                        {"current_price": current_price, "resistance": resistance[0]}
                    )
                    alerts.append(alert)
            
            elif condition.alert_type == AlertType.BREAKDOWN:
                support = analysis.get('support_levels', [])
                current_price = analysis.get('current_price', 0)
                
                if support and current_price < support[0]:
                    alert = self._create_alert(
                        condition,
                        f"{symbol} Breakdown below support",
                        {"current_price": current_price, "support": support[0]}
                    )
                    alerts.append(alert)
        
        return alerts
    
    def _create_alert(self, condition: AlertCondition, message: str, data: Dict) -> Alert:
        """Create an alert instance."""
        alert = Alert(
            id=str(datetime.now().timestamp()),
            condition=condition,
            timestamp=datetime.now(),
            message=message,
            data=data
        )
        self.alert_history.append(alert)
        return alert
    
    def send_alert(self, alert: Alert) -> bool:
        """Send alert through configured channels."""
        success = True
        
        for channel in alert.condition.channels:
            try:
                if channel == AlertChannel.EMAIL:
                    self._send_email_alert(alert)
                elif channel == AlertChannel.TELEGRAM:
                    self._send_telegram_alert(alert)
                elif channel == AlertChannel.WEBHOOK:
                    self._send_webhook_alert(alert)
                elif channel == AlertChannel.DASHBOARD:
                    # Dashboard alerts are stored in history
                    pass
                
                if not alert.sent_channels:
                    alert.sent_channels = []
                alert.sent_channels.append(channel)
                
            except Exception as e:
                logger.error(f"Failed to send alert via {channel}: {str(e)}")
                success = False
        
        alert.sent = True
        return success
    
    def _send_email_alert(self, alert: Alert):
        """Send alert via email."""
        if not settings.EMAIL_ENABLED:
            logger.warning("Email not configured")
            return
        
        msg = MIMEMultipart()
        msg['From'] = settings.EMAIL_FROM
        msg['To'] = settings.EMAIL_TO
        msg['Subject'] = f"🚨 Trading Alert: {alert.condition.symbol}"
        
        body = f"""
        <h2>Trading Alert</h2>
        <p><strong>Symbol:</strong> {alert.condition.symbol}</p>
        <p><strong>Time:</strong> {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S')}</p>
        <p><strong>Message:</strong> {alert.message}</p>
        <h3>Details:</h3>
        <pre>{alert.data}</pre>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Email alert sent for {alert.condition.symbol}")
    
    def _send_telegram_alert(self, alert: Alert):
        """Send alert via Telegram."""
        if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
            logger.warning("Telegram not configured")
            return
        
        message = f"""
🚨 *Trading Alert*

*Symbol:* {alert.condition.symbol}
*Time:* {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S')}
*Message:* {alert.message}

*Details:*
{alert.data}
        """
        
        url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
        params = {
            'chat_id': settings.TELEGRAM_CHAT_ID,
            'text': message,
            'parse_mode': 'Markdown'
        }
        
        response = requests.post(url, params=params)
        response.raise_for_status()
        
        logger.info(f"Telegram alert sent for {alert.condition.symbol}")
    
    def _send_webhook_alert(self, alert: Alert):
        """Send alert via webhook."""
        if not settings.WEBHOOK_URL:
            logger.warning("Webhook not configured")
            return
        
        payload = {
            'alert_id': alert.id,
            'symbol': alert.condition.symbol,
            'timestamp': alert.timestamp.isoformat(),
            'message': alert.message,
            'data': alert.data,
            'alert_type': alert.condition.alert_type.value
        }
        
        response = requests.post(settings.WEBHOOK_URL, json=payload)
        response.raise_for_status()
        
        logger.info(f"Webhook alert sent for {alert.condition.symbol}")
    
    async def monitor_markets(self, interval: int = 60):
        """Continuously monitor markets for alert conditions."""
        self.running = True
        logger.info("Starting market monitoring...")
        
        while self.running:
            try:
                # Get unique symbols to monitor
                symbols_to_check = set(
                    (c.symbol, c.asset_type) for c in self.active_conditions if c.enabled
                )
                
                for symbol, asset_type in symbols_to_check:
                    try:
                        # Get analysis
                        analysis = analysis_service.analyze_symbol(symbol, asset_type)
                        current_price = analysis.get('current_price')
                        
                        # Check all conditions
                        alerts = []
                        alerts.extend(self.check_price_conditions(symbol, asset_type, current_price))
                        alerts.extend(self.check_indicator_conditions(symbol, asset_type, analysis))
                        alerts.extend(self.check_signal_conditions(symbol, asset_type, analysis))
                        
                        # Send alerts
                        for alert in alerts:
                            # Check if similar alert was sent recently (avoid spam)
                            recent_alerts = [
                                a for a in self.alert_history[-10:]
                                if a.condition.symbol == symbol
                                and a.condition.alert_type == alert.condition.alert_type
                                and (datetime.now() - a.timestamp).seconds < 300  # 5 min cooldown
                            ]
                            
                            if not recent_alerts:
                                self.send_alert(alert)
                                logger.info(f"Alert sent: {alert.message}")
                        
                        # Store last signal for comparison
                        self.last_signals[symbol] = analysis
                    
                    except Exception as e:
                        logger.error(f"Error monitoring {symbol}: {str(e)}")
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {str(e)}")
            
            await asyncio.sleep(interval)
        
        logger.info("Market monitoring stopped")
    
    def stop_monitoring(self):
        """Stop market monitoring."""
        self.running = False
        logger.info("Stopping market monitoring...")
    
    def get_active_alerts(self) -> List[Dict]:
        """Get recent alerts."""
        recent_alerts = [
            {
                'id': alert.id,
                'symbol': alert.condition.symbol,
                'message': alert.message,
                'timestamp': alert.timestamp.isoformat(),
                'data': alert.data,
                'sent': alert.sent,
                'channels': [c.value for c in alert.condition.channels]
            }
            for alert in self.alert_history[-50:]  # Last 50 alerts
        ]
        return recent_alerts
    
    def get_alert_conditions(self) -> List[Dict]:
        """Get all active alert conditions."""
        return [
            {
                'id': str(id(c)),
                'symbol': c.symbol,
                'asset_type': c.asset_type,
                'alert_type': c.alert_type.value,
                'threshold': c.threshold,
                'confidence_min': c.confidence_min,
                'enabled': c.enabled,
                'channels': [ch.value for ch in c.channels]
            }
            for c in self.active_conditions
        ]


# Singleton instance
alert_service = AlertService()
