import asyncio
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.alert_service import alert_service
from config.settings import settings


async def main():
    """Main function to run alert monitoring."""
    print("=" * 60)
    print("🚨 TRADING ALERT MONITORING SERVICE")
    print("=" * 60)
    print(f"Check Interval: {settings.ALERT_CHECK_INTERVAL} seconds")
    print(f"Email Enabled: {settings.EMAIL_ENABLED}")
    print(f"Telegram Enabled: {bool(settings.TELEGRAM_BOT_TOKEN)}")
    print(f"Webhook Enabled: {bool(settings.WEBHOOK_URL)}")
    print("=" * 60)
    print("\nStarting market monitoring...")
    print("Press Ctrl+C to stop\n")
    
    try:
        # Start monitoring
        await alert_service.monitor_markets(interval=settings.ALERT_CHECK_INTERVAL)
    except KeyboardInterrupt:
        print("\n\nStopping alert monitoring...")
        alert_service.stop_monitoring()
        print("Alert monitoring stopped.")
    except Exception as e:
        print(f"\nError: {str(e)}")
        alert_service.stop_monitoring()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
