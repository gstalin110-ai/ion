import requests
import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from config.settings import settings


class AlphaVantageService:
    """Service for fetching data from Alpha Vantage API."""
    
    BASE_URL = "https://www.alphavantage.co/query"
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.ALPHA_VANTAGE_API_KEY
        if not self.api_key:
            raise ValueError("Alpha Vantage API key is required")
    
    def _make_request(self, params: Dict) -> Dict:
        """Make a request to Alpha Vantage API."""
        params["apikey"] = self.api_key
        try:
            response = requests.get(self.BASE_URL, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Check for API errors
            if "Error Message" in data:
                raise ValueError(f"Alpha Vantage API Error: {data['Error Message']}")
            if "Note" in data:
                raise ValueError(f"Alpha Vantage API Rate Limit: {data['Note']}")
            if "Information" in data:
                raise ValueError(f"Alpha Vantage API Info: {data['Information']}")
                
            return data
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")
    
    def get_forex_rate(self, from_currency: str, to_currency: str = "USD") -> Dict:
        """Get current forex exchange rate."""
        params = {
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": from_currency,
            "to_currency": to_currency
        }
        data = self._make_request(params)
        return data.get("Realtime Currency Exchange Rate", {})
    
    def get_forex_daily(
        self, 
        from_symbol: str, 
        to_symbol: str = "USD",
        outputsize: str = "full"
    ) -> pd.DataFrame:
        """Get daily forex rates (historical data).
        
        Args:
            from_symbol: Base currency (e.g., "EUR")
            to_symbol: Quote currency (e.g., "USD")
            outputsize: "compact" (100 days) or "full" (20+ years)
        
        Returns:
            DataFrame with columns: date, open, high, low, close, volume
        """
        params = {
            "function": "FX_DAILY",
            "from_symbol": from_symbol,
            "to_symbol": to_symbol,
            "outputsize": outputsize
        }
        data = self._make_request(params)
        
        time_series = data.get(f"Time Series FX (Daily)", {})
        if not time_series:
            raise ValueError("No data returned from Alpha Vantage")
        
        df = pd.DataFrame.from_dict(time_series, orient="index")
        df.index = pd.to_datetime(df.index)
        df.columns = ["open", "high", "low", "close"]
        df = df.astype(float)
        df = df.sort_index()
        
        return df
    
    def get_commodity_price(self, symbol: str) -> Dict:
        """Get current commodity price.
        
        Args:
            symbol: Commodity symbol (e.g., "GOLD", "SILVER")
        
        Returns:
            Dictionary with current price data
        """
        params = {
            "function": "COMMODITY_EXCHANGE_RATE",
            "from_currency": symbol,
            "to_currency": "USD"
        }
        data = self._make_request(params)
        return data.get("data", {})
    
    def get_commodity_daily(
        self,
        symbol: str,
        outputsize: str = "full"
    ) -> pd.DataFrame:
        """Get daily commodity prices (historical data).
        
        Args:
            symbol: Commodity symbol (e.g., "GOLD")
            outputsize: "compact" (100 days) or "full" (20+ years)
        
        Returns:
            DataFrame with columns: date, open, high, low, close, volume
        """
        # Alpha Vantage uses different function for commodities
        # Using SYMBOL_SEARCH to find the correct symbol first
        params = {
            "function": "SYMBOL_SEARCH",
            "keywords": symbol
        }
        search_data = self._make_request(params)
        
        # Get the best match
        matches = search_data.get("bestMatches", [])
        if not matches:
            raise ValueError(f"No matches found for commodity: {symbol}")
        
        # Use the first match's symbol
        actual_symbol = matches[0]["1. symbol"]
        
        # Get daily data
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": actual_symbol,
            "outputsize": outputsize
        }
        data = self._make_request(params)
        
        time_series = data.get(f"Time Series (Daily)", {})
        if not time_series:
            raise ValueError("No data returned from Alpha Vantage")
        
        df = pd.DataFrame.from_dict(time_series, orient="index")
        df.index = pd.to_datetime(df.index)
        df.columns = ["open", "high", "low", "close", "volume"]
        df = df.astype(float)
        df = df.sort_index()
        
        return df
    
    def get_technical_indicator(
        self,
        symbol: str,
        indicator: str,
        interval: str = "daily",
        time_period: int = 14,
        series_type: str = "close"
    ) -> pd.DataFrame:
        """Get technical indicator data.
        
        Args:
            symbol: Asset symbol
            indicator: Indicator name (e.g., "SMA", "RSI", "MACD")
            interval: Time interval (1min, 5min, 15min, 30min, 60min, daily, weekly, monthly)
            time_period: Time period for indicator
            series_type: Price type to use (close, open, high, low)
        
        Returns:
            DataFrame with indicator values
        """
        params = {
            "function": indicator,
            "symbol": symbol,
            "interval": interval,
            "time_period": time_period,
            "series_type": series_type
        }
        data = self._make_request(params)
        
        # Extract the time series data
        key = None
        for k in data.keys():
            if "Technical Analysis" in k or "Time Series" in k:
                key = k
                break
        
        if not key:
            raise ValueError(f"No indicator data returned for {indicator}")
        
        df = pd.DataFrame.from_dict(data[key], orient="index")
        df.index = pd.to_datetime(df.index)
        df = df.astype(float)
        df = df.sort_index()
        
        return df
    
    def get_multiple_forex_rates(self, pairs: List[str]) -> Dict[str, Dict]:
        """Get current rates for multiple forex pairs.
        
        Args:
            pairs: List of currency pairs in format "EUR/USD"
        
        Returns:
            Dictionary mapping pair to rate data
        """
        results = {}
        for pair in pairs:
            try:
                from_curr, to_curr = pair.split("/")
                rate_data = self.get_forex_rate(from_curr, to_curr)
                results[pair] = rate_data
            except Exception as e:
                print(f"Error fetching {pair}: {str(e)}")
                results[pair] = None
        
        return results
    
    def get_last_5_years_data(
        self,
        symbol: str,
        asset_type: str = "forex",
        to_symbol: str = "USD"
    ) -> pd.DataFrame:
        """Get data for the last 5 years.
        
        Args:
            symbol: Asset symbol
            asset_type: "forex" or "commodity"
            to_symbol: Quote currency (for forex)
        
        Returns:
            DataFrame with 5 years of historical data
        """
        if asset_type == "forex":
            df = self.get_forex_daily(symbol, to_symbol, outputsize="full")
        else:
            df = self.get_commodity_daily(symbol, outputsize="full")
        
        # Filter to last 5 years
        five_years_ago = datetime.now() - timedelta(days=365*5)
        df = df[df.index >= five_years_ago]
        
        return df


class DataService:
    """Main data service that aggregates multiple data sources."""
    
    def __init__(self):
        self.alpha_vantage = AlphaVantageService()
    
    def get_forex_data(self, pair: str, period: str = "daily") -> Dict:
        """Get forex data for a specific pair."""
        from_curr, to_curr = pair.split("/")
        
        if period == "current":
            return self.alpha_vantage.get_forex_rate(from_curr, to_curr)
        else:
            df = self.alpha_vantage.get_forex_daily(from_curr, to_curr)
            return {
                "symbol": pair,
                "data": df.to_dict(orient="records"),
                "last_updated": datetime.now().isoformat()
            }
    
    def get_commodity_data(self, symbol: str, period: str = "daily") -> Dict:
        """Get commodity data."""
        if period == "current":
            return self.alpha_vantage.get_commodity_price(symbol)
        else:
            df = self.alpha_vantage.get_commodity_daily(symbol)
            return {
                "symbol": symbol,
                "data": df.to_dict(orient="records"),
                "last_updated": datetime.now().isoformat()
            }
    
    def get_market_overview(self) -> Dict:
        """Get overview of all supported markets."""
        overview = {
            "forex": {},
            "commodities": {}
        }
        
        # Get forex rates
        forex_rates = self.alpha_vantage.get_multiple_forex_rates(settings.FOREX_PAIRS[:5])
        overview["forex"] = forex_rates
        
        # Get commodity prices
        for commodity in settings.COMMODITIES[:5]:
            try:
                price_data = self.alpha_vantage.get_commodity_price(commodity)
                overview["commodities"][commodity] = price_data
            except Exception as e:
                print(f"Error fetching {commodity}: {str(e)}")
                overview["commodities"][commodity] = None
        
        overview["last_updated"] = datetime.now().isoformat()
        return overview


# Singleton instance
data_service = DataService()
