from fastapi import APIRouter, HTTPException
from typing import Dict, List, Optional
from app.services.data_service import data_service
from app.services.analysis_service import analysis_service
from app.services.alert_service import alert_service, AlertType, AlertChannel
from config.settings import settings

router = APIRouter()


@router.get("/market/overview")
async def get_market_overview() -> Dict:
    """Get market overview with current rates for forex and commodities."""
    try:
        overview = data_service.get_market_overview()
        return overview
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forex/{pair}")
async def get_forex_data(pair: str, period: str = "daily") -> Dict:
    """Get forex data for a specific pair.
    
    Args:
        pair: Currency pair in format "EUR/USD"
        period: "current" for current rate, "daily" for historical data
    """
    try:
        if pair not in settings.FOREX_PAIRS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported pair. Supported pairs: {settings.FOREX_PAIRS}"
            )
        
        data = data_service.get_forex_data(pair, period)
        return data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/commodities/{symbol}")
async def get_commodity_data(symbol: str, period: str = "daily") -> Dict:
    """Get commodity data for a specific symbol.
    
    Args:
        symbol: Commodity symbol (e.g., "GOLD")
        period: "current" for current price, "daily" for historical data
    """
    try:
        if symbol not in settings.COMMODITIES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported commodity. Supported: {settings.COMMODITIES}"
            )
        
        data = data_service.get_commodity_data(symbol, period)
        return data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/forex/pairs")
async def get_forex_pairs() -> Dict:
    """Get list of supported forex pairs."""
    return {"pairs": settings.FOREX_PAIRS}


@router.get("/commodities/symbols")
async def get_commodity_symbols() -> Dict:
    """Get list of supported commodity symbols."""
    return {"symbols": settings.COMMODITIES}


@router.get("/indicator/{symbol}")
async def get_technical_indicator(
    symbol: str,
    indicator: str = "SMA",
    interval: str = "daily",
    time_period: int = 14
) -> Dict:
    """Get technical indicator data for a symbol.
    
    Args:
        symbol: Asset symbol (e.g., "EURUSD")
        indicator: Indicator name (SMA, EMA, RSI, MACD, BBANDS)
        interval: Time interval
        time_period: Time period for indicator
    """
    try:
        # Convert pair format from EUR/USD to EURUSD
        if "/" in symbol:
            symbol = symbol.replace("/", "")
        
        df = data_service.alpha_vantage.get_technical_indicator(
            symbol,
            indicator,
            interval,
            time_period
        )
        
        return {
            "symbol": symbol,
            "indicator": indicator,
            "time_period": time_period,
            "data": df.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/historical/{symbol}")
async def get_historical_data(
    symbol: str,
    asset_type: str = "forex",
    years: int = 5
) -> Dict:
    """Get historical data for the specified number of years.
    
    Args:
        symbol: Asset symbol
        asset_type: "forex" or "commodity"
        years: Number of years of historical data (max 5)
    """
    try:
        if years > 5:
            raise HTTPException(
                status_code=400,
                detail="Maximum 5 years of historical data available"
            )
        
        to_symbol = "USD" if asset_type == "forex" else None
        df = data_service.alpha_vantage.get_last_5_years_data(
            symbol,
            asset_type,
            to_symbol
        )
        
        # Filter to requested years
        from datetime import datetime, timedelta
        cutoff = datetime.now() - timedelta(days=365*years)
        df = df[df.index >= cutoff]
        
        return {
            "symbol": symbol,
            "asset_type": asset_type,
            "years": years,
            "data": df.to_dict(orient="records"),
            "records": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/signal/{symbol}")
async def get_trading_signal(
    symbol: str,
    asset_type: str = "forex"
) -> Dict:
    """Get trading signal with coordinates for a specific symbol.
    
    Args:
        symbol: Asset symbol (e.g., "EUR/USD" for forex, "GOLD" for commodity)
        asset_type: "forex" or "commodity"
    
    Returns:
        Complete trading signal with entry, stop loss, take profit coordinates
    """
    try:
        if asset_type == "forex" and symbol not in settings.FOREX_PAIRS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported forex pair. Supported: {settings.FOREX_PAIRS}"
            )
        
        if asset_type == "commodity" and symbol not in settings.COMMODITIES:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported commodity. Supported: {settings.COMMODITIES}"
            )
        
        analysis = analysis_service.analyze_symbol(symbol, asset_type)
        return analysis
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/signals/opportunities")
async def get_trading_opportunities(
    asset_type: str = "forex",
    min_confidence: float = 60.0
) -> Dict:
    """Get best trading opportunities across all symbols.
    
    Args:
        asset_type: "forex" or "commodity"
        min_confidence: Minimum confidence threshold (0-100)
    
    Returns:
        List of trading opportunities sorted by confidence
    """
    try:
        if min_confidence < 0 or min_confidence > 100:
            raise HTTPException(
                status_code=400,
                detail="Confidence must be between 0 and 100"
            )
        
        opportunities = analysis_service.get_best_opportunities(asset_type, min_confidence)
        
        return {
            "asset_type": asset_type,
            "min_confidence": min_confidence,
            "opportunities_found": len(opportunities),
            "opportunities": opportunities
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analysis/summary")
async def get_analysis_summary() -> Dict:
    """Get a summary of analysis for all supported symbols."""
    try:
        # Analyze forex pairs
        forex_analyses = []
        for pair in settings.FOREX_PAIRS[:5]:  # Limit to first 5 for performance
            try:
                analysis = analysis_service.analyze_symbol(pair, "forex")
                forex_analyses.append({
                    "symbol": pair,
                    "signal": analysis["signal"],
                    "confidence": analysis["confidence"],
                    "current_price": analysis["current_price"]
                })
            except Exception as e:
                print(f"Error analyzing {pair}: {str(e)}")
        
        # Analyze commodities
        commodity_analyses = []
        for comm in settings.COMMODITIES[:5]:  # Limit to first 5 for performance
            try:
                analysis = analysis_service.analyze_symbol(comm, "commodity")
                commodity_analyses.append({
                    "symbol": comm,
                    "signal": analysis["signal"],
                    "confidence": analysis["confidence"],
                    "current_price": analysis["current_price"]
                })
            except Exception as e:
                print(f"Error analyzing {comm}: {str(e)}")
        
        return {
            "forex_signals": forex_analyses,
            "commodity_signals": commodity_analyses,
            "timestamp": analysis_service.data_service.alpha_vantage._make_request({})["timestamp"] if False else "N/A"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Alert Endpoints

@router.post("/alerts/conditions")
async def add_alert_condition(
    symbol: str,
    asset_type: str,
    alert_type: str,
    threshold: Optional[float] = None,
    confidence_min: float = 60.0,
    channels: Optional[List[str]] = None
) -> Dict:
    """Add a new alert condition."""
    try:
        # Convert alert_type string to enum
        alert_type_enum = AlertType(alert_type)
        
        # Convert channels to enum
        channel_enums = []
        if channels:
            for ch in channels:
                channel_enums.append(AlertChannel(ch))
        
        condition = alert_service.add_alert_condition(
            symbol=symbol,
            asset_type=asset_type,
            alert_type=alert_type_enum,
            threshold=threshold,
            confidence_min=confidence_min,
            channels=channel_enums
        )
        
        return {
            "status": "success",
            "condition_id": str(id(condition)),
            "message": f"Alert condition added for {symbol}"
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts/conditions")
async def get_alert_conditions() -> Dict:
    """Get all active alert conditions."""
    try:
        conditions = alert_service.get_alert_conditions()
        return {
            "conditions": conditions,
            "total": len(conditions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/alerts/conditions/{condition_id}")
async def remove_alert_condition(condition_id: str) -> Dict:
    """Remove an alert condition."""
    try:
        success = alert_service.remove_alert_condition(condition_id)
        if success:
            return {"status": "success", "message": "Alert condition removed"}
        else:
            raise HTTPException(status_code=404, detail="Condition not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts/history")
async def get_alert_history() -> Dict:
    """Get alert history."""
    try:
        alerts = alert_service.get_active_alerts()
        return {
            "alerts": alerts,
            "total": len(alerts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alerts/test")
async def test_alert(
    symbol: str,
    message: str = "Test alert"
) -> Dict:
    """Send a test alert."""
    try:
        from app.services.alert_service import AlertCondition, Alert
        from datetime import datetime
        
        condition = AlertCondition(
            symbol=symbol,
            asset_type="forex",
            alert_type=AlertType.SIGNAL_GENERATED,
            channels=[AlertChannel.DASHBOARD]
        )
        
        alert = Alert(
            id="test-" + str(datetime.now().timestamp()),
            condition=condition,
            timestamp=datetime.now(),
            message=message,
            data={"test": True}
        )
        
        success = alert_service.send_alert(alert)
        
        return {
            "status": "success" if success else "failed",
            "message": "Test alert sent"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
