import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime
from app.services.data_service import data_service


class TechnicalAnalysisService:
    """Service for advanced technical analysis and signal generation."""
    
    def __init__(self):
        self.data_service = data_service
    
    def calculate_sma(self, df: pd.DataFrame, period: int = 20) -> pd.Series:
        """Calculate Simple Moving Average."""
        return df['close'].rolling(window=period).mean()
    
    def calculate_ema(self, df: pd.DataFrame, period: int = 20) -> pd.Series:
        """Calculate Exponential Moving Average."""
        return df['close'].ewm(span=period, adjust=False).mean()
    
    def calculate_rsi(self, df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculate Relative Strength Index."""
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def calculate_macd(self, df: pd.DataFrame) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """Calculate MACD (Moving Average Convergence Divergence)."""
        ema_12 = df['close'].ewm(span=12, adjust=False).mean()
        ema_26 = df['close'].ewm(span=26, adjust=False).mean()
        macd_line = ema_12 - ema_26
        signal_line = macd_line.ewm(span=9, adjust=False).mean()
        histogram = macd_line - signal_line
        return macd_line, signal_line, histogram
    
    def calculate_bollinger_bands(
        self, 
        df: pd.DataFrame, 
        period: int = 20, 
        std_dev: int = 2
    ) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """Calculate Bollinger Bands."""
        sma = self.calculate_sma(df, period)
        std = df['close'].rolling(window=period).std()
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)
        return upper_band, sma, lower_band
    
    def calculate_atr(self, df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculate Average True Range (for volatility)."""
        high_low = df['high'] - df['low']
        high_close = np.abs(df['high'] - df['close'].shift())
        low_close = np.abs(df['low'] - df['close'].shift())
        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean()
        return atr
    
    def calculate_stochastic(self, df: pd.DataFrame, k_period: int = 14, d_period: int = 3) -> Tuple[pd.Series, pd.Series]:
        """Calculate Stochastic Oscillator."""
        low_min = df['low'].rolling(window=k_period).min()
        high_max = df['high'].rolling(window=k_period).max()
        
        k_percent = 100 * ((df['close'] - low_min) / (high_max - low_min))
        d_percent = k_percent.rolling(window=d_period).mean()
        
        return k_percent, d_percent
    
    def calculate_cci(self, df: pd.DataFrame, period: int = 20) -> pd.Series:
        """Calculate Commodity Channel Index."""
        tp = (df['high'] + df['low'] + df['close']) / 3
        sma_tp = tp.rolling(window=period).mean()
        mad = tp.rolling(window=period).apply(lambda x: np.abs(x - x.mean()).mean())
        cci = (tp - sma_tp) / (0.015 * mad)
        return cci
    
    def calculate_adx(self, df: pd.DataFrame, period: int = 14) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """Calculate Average Directional Index (ADX)."""
        high = df['high']
        low = df['low']
        close = df['close']
        
        plus_dm = high.diff()
        minus_dm = -low.diff()
        
        plus_dm[plus_dm < 0] = 0
        minus_dm[minus_dm < 0] = 0
        
        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        
        atr = tr.rolling(window=period).mean()
        plus_di = 100 * (plus_dm.rolling(window=period).mean() / atr)
        minus_di = 100 * (minus_dm.rolling(window=period).mean() / atr)
        
        dx = 100 * abs(plus_di - minus_di) / (plus_di + minus_di)
        adx = dx.rolling(window=period).mean()
        
        return adx, plus_di, minus_di
    
    def calculate_williams_r(self, df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculate Williams %R."""
        high_high = df['high'].rolling(window=period).max()
        low_low = df['low'].rolling(window=period).min()
        williams_r = -100 * ((high_high - df['close']) / (high_high - low_low))
        return williams_r
    
    def calculate_parabolic_sar(self, df: pd.DataFrame, af: float = 0.02, max_af: float = 0.2) -> pd.Series:
        """Calculate Parabolic SAR."""
        high = df['high'].values
        low = df['low'].values
        close = df['close'].values
        
        length = len(df)
        psar = np.zeros(length)
        psar[0] = low[0]
        ep = high[0]
        af = af
        trend = 1  # 1 for uptrend, -1 for downtrend
        
        for i in range(1, length):
            if trend == 1:
                psar[i] = psar[i-1] + af * (ep - psar[i-1])
                psar[i] = min(psar[i], low[i-1], low[i-2])
                
                if high[i] > ep:
                    ep = high[i]
                    af = min(af + 0.02, max_af)
                
                if low[i] < psar[i]:
                    trend = -1
                    psar[i] = ep
                    ep = low[i]
                    af = 0.02
            else:
                psar[i] = psar[i-1] + af * (ep - psar[i-1])
                psar[i] = max(psar[i], high[i-1], high[i-2])
                
                if low[i] < ep:
                    ep = low[i]
                    af = min(af + 0.02, max_af)
                
                if high[i] > psar[i]:
                    trend = 1
                    psar[i] = ep
                    ep = high[i]
                    af = 0.02
        
        return pd.Series(psar, index=df.index)
    
    def calculate_ichimoku(self, df: pd.DataFrame) -> Dict[str, pd.Series]:
        """Calculate Ichimoku Cloud components."""
        high = df['high']
        low = df['low']
        close = df['close']
        
        # Tenkan-sen (Conversion Line): (9-period high + 9-period low) / 2
        tenkan_sen = (high.rolling(window=9).max() + low.rolling(window=9).min()) / 2
        
        # Kijun-sen (Base Line): (26-period high + 26-period low) / 2
        kijun_sen = (high.rolling(window=26).max() + low.rolling(window=26).min()) / 2
        
        # Senkou Span A (Leading Span A): (Tenkan-sen + Kijun-sen) / 2, shifted 26 periods ahead
        senkou_span_a = ((tenkan_sen + kijun_sen) / 2).shift(26)
        
        # Senkou Span B (Leading Span B): (52-period high + 52-period low) / 2, shifted 26 periods ahead
        senkou_span_b = ((high.rolling(window=52).max() + low.rolling(window=52).min()) / 2).shift(26)
        
        # Chikou Span (Lagging Span): Close, shifted 26 periods behind
        chikou_span = close.shift(-26)
        
        return {
            'tenkan_sen': tenkan_sen,
            'kijun_sen': kijun_sen,
            'senkou_span_a': senkou_span_a,
            'senkou_span_b': senkou_span_b,
            'chikou_span': chikou_span
        }
    
    def calculate_mfi(self, df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Calculate Money Flow Index."""
        typical_price = (df['high'] + df['low'] + df['close']) / 3
        money_flow = typical_price * df['volume']
        
        positive_flow = money_flow.where(typical_price > typical_price.shift(), 0)
        negative_flow = money_flow.where(typical_price < typical_price.shift(), 0)
        
        positive_mf = positive_flow.rolling(window=period).sum()
        negative_mf = negative_flow.rolling(window=period).sum()
        
        mfi = 100 - (100 / (1 + positive_mf / negative_mf))
        return mfi
    
    def calculate_obv(self, df: pd.DataFrame) -> pd.Series:
        """Calculate On-Balance Volume."""
        obv = (np.sign(df['close'].diff()) * df['volume']).fillna(0).cumsum()
        return obv
    
    def calculate_keltner_channels(self, df: pd.DataFrame, period: int = 20, multiplier: float = 2) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """Calculate Keltner Channels."""
        ema = df['close'].ewm(span=period, adjust=False).mean()
        atr = self.calculate_atr(df, period)
        
        upper_band = ema + (multiplier * atr)
        lower_band = ema - (multiplier * atr)
        
        return upper_band, ema, lower_band
    
    def calculate_donchian_channels(self, df: pd.DataFrame, period: int = 20) -> Tuple[pd.Series, pd.Series]:
        """Calculate Donchian Channels."""
        upper_band = df['high'].rolling(window=period).max()
        lower_band = df['low'].rolling(window=period).min()
        middle_band = (upper_band + lower_band) / 2
        
        return upper_band, lower_band
    
    def find_support_resistance(
        self, 
        df: pd.DataFrame, 
        lookback: int = 20
    ) -> Tuple[List[float], List[float]]:
        """Find support and resistance levels."""
        highs = df['high'].rolling(window=lookback, center=True).max()
        lows = df['low'].rolling(window=lookback, center=True).min()
        
        # Find local maxima and minima
        resistance_levels = df['high'][(df['high'] == highs) & (highs.notna())].tolist()
        support_levels = df['low'][(df['low'] == lows) & (lows.notna())].tolist()
        
        # Get most recent levels
        resistance_levels = sorted(list(set(resistance_levels)), reverse=True)[:5]
        support_levels = sorted(list(set(support_levels)))[:5]
        
        return support_levels, resistance_levels
    
    def detect_candlestick_patterns(self, df: pd.DataFrame) -> Dict[str, str]:
        """Detect candlestick patterns."""
        patterns = {}
        last_candle = df.iloc[-1]
        prev_candle = df.iloc[-2] if len(df) > 1 else None
        
        open_price = last_candle['open']
        close_price = last_candle['close']
        high_price = last_candle['high']
        low_price = last_candle['low']
        
        body = abs(close_price - open_price)
        upper_shadow = high_price - max(open_price, close_price)
        lower_shadow = min(open_price, close_price) - low_price
        total_range = high_price - low_price
        
        # Doji (body very small)
        if body < total_range * 0.1:
            patterns['doji'] = 'Doji - Indecision'
        
        # Hammer (small body at top, long lower shadow)
        if lower_shadow > body * 2 and upper_shadow < body * 0.5:
            if close_price > open_price:
                patterns['hammer'] = 'Hammer - Bullish reversal'
            else:
                patterns['inverted_hammer'] = 'Inverted Hammer - Bullish reversal'
        
        # Shooting Star (small body at bottom, long upper shadow)
        if upper_shadow > body * 2 and lower_shadow < body * 0.5:
            patterns['shooting_star'] = 'Shooting Star - Bearish reversal'
        
        # Engulfing patterns
        if prev_candle is not None:
            prev_open = prev_candle['open']
            prev_close = prev_candle['close']
            prev_body = abs(prev_close - prev_open)
            
            # Bullish Engulfing
            if (prev_close < prev_open and  # Previous red candle
                close_price > open_price and  # Current green candle
                open_price < prev_close and  # Opens below previous close
                close_price > prev_open):  # Closes above previous open
                patterns['bullish_engulfing'] = 'Bullish Engulfing - Strong buy signal'
            
            # Bearish Engulfing
            if (prev_close > prev_open and  # Previous green candle
                close_price < open_price and  # Current red candle
                open_price > prev_close and  # Opens above previous close
                close_price < prev_open):  # Closes below previous open
                patterns['bearish_engulfing'] = 'Bearish Engulfing - Strong sell signal'
        
        # Morning Star (3-candle bullish reversal)
        if len(df) >= 3:
            candle1 = df.iloc[-3]
            candle2 = df.iloc[-2]
            
            if (candle1['close'] < candle1['open'] and  # First candle red
                abs(candle2['close'] - candle2['open']) < body * 0.3 and  # Second candle small body
                close_price > open_price and  # Third candle green
                close_price > (candle1['open'] + candle1['close']) / 2):  # Closes above midpoint
                patterns['morning_star'] = 'Morning Star - Bullish reversal'
        
        # Evening Star (3-candle bearish reversal)
        if len(df) >= 3:
            candle1 = df.iloc[-3]
            candle2 = df.iloc[-2]
            
            if (candle1['close'] > candle1['open'] and  # First candle green
                abs(candle2['close'] - candle2['open']) < body * 0.3 and  # Second candle small body
                close_price < open_price and  # Third candle red
                close_price < (candle1['open'] + candle1['close']) / 2):  # Closes below midpoint
                patterns['evening_star'] = 'Evening Star - Bearish reversal'
        
        return patterns
    
    def calculate_fibonacci_retracement(self, df: pd.DataFrame) -> Dict[str, float]:
        """Calculate Fibonacci retracement levels."""
        high_price = df['high'].max()
        low_price = df['low'].min()
        diff = high_price - low_price
        
        return {
            '0% (high)': high_price,
            '23.6%': high_price - (diff * 0.236),
            '38.2%': high_price - (diff * 0.382),
            '50%': high_price - (diff * 0.5),
            '61.8%': high_price - (diff * 0.618),
            '78.6%': high_price - (diff * 0.786),
            '100% (low)': low_price
        }
    
    def calculate_sl_tp_methods(
        self, 
        current_price: float, 
        signal: str,
        atr: float,
        support_levels: List[float],
        resistance_levels: List[float],
        pivot_points: Dict[str, float]
    ) -> Dict[str, Dict]:
        """Calculate Stop Loss and Take Profit using multiple methods."""
        methods = {}
        
        if signal == "BUY":
            # Method 1: ATR-based (2x ATR)
            methods['atr'] = {
                'stop_loss': current_price - (atr * 2),
                'take_profit_1': current_price + (atr * 2),
                'take_profit_2': current_price + (atr * 3),
                'take_profit_3': current_price + (atr * 4)
            }
            
            # Method 2: Percentage-based (1% SL, 2% TP)
            methods['percentage'] = {
                'stop_loss': current_price * 0.99,
                'take_profit_1': current_price * 1.02,
                'take_profit_2': current_price * 1.03,
                'take_profit_3': current_price * 1.04
            }
            
            # Method 3: Support/Resistance-based
            if support_levels:
                nearest_support = max([s for s in support_levels if s < current_price])
                methods['support_resistance'] = {
                    'stop_loss': nearest_support,
                    'take_profit_1': pivot_points.get('r1', current_price * 1.02),
                    'take_profit_2': pivot_points.get('r2', current_price * 1.03),
                    'take_profit_3': pivot_points.get('r3', current_price * 1.04)
                }
            
            # Method 4: Pivot Points-based
            methods['pivot_points'] = {
                'stop_loss': pivot_points.get('s1', current_price * 0.99),
                'take_profit_1': pivot_points.get('r1', current_price * 1.02),
                'take_profit_2': pivot_points.get('r2', current_price * 1.03),
                'take_profit_3': pivot_points.get('r3', current_price * 1.04)
            }
            
            # Method 5: Fibonacci-based
            fib = self.calculate_fibonacci_retracement(df=None)
            methods['fibonacci'] = {
                'stop_loss': fib.get('38.2%', current_price * 0.99),
                'take_profit_1': fib.get('23.6%', current_price * 1.02),
                'take_profit_2': fib.get('0% (high)', current_price * 1.03),
                'take_profit_3': current_price * 1.04
            }
            
        elif signal == "SELL":
            # Method 1: ATR-based (2x ATR)
            methods['atr'] = {
                'stop_loss': current_price + (atr * 2),
                'take_profit_1': current_price - (atr * 2),
                'take_profit_2': current_price - (atr * 3),
                'take_profit_3': current_price - (atr * 4)
            }
            
            # Method 2: Percentage-based (1% SL, 2% TP)
            methods['percentage'] = {
                'stop_loss': current_price * 1.01,
                'take_profit_1': current_price * 0.98,
                'take_profit_2': current_price * 0.97,
                'take_profit_3': current_price * 0.96
            }
            
            # Method 3: Support/Resistance-based
            if resistance_levels:
                nearest_resistance = min([r for r in resistance_levels if r > current_price])
                methods['support_resistance'] = {
                    'stop_loss': nearest_resistance,
                    'take_profit_1': pivot_points.get('s1', current_price * 0.98),
                    'take_profit_2': pivot_points.get('s2', current_price * 0.97),
                    'take_profit_3': pivot_points.get('s3', current_price * 0.96)
                }
            
            # Method 4: Pivot Points-based
            methods['pivot_points'] = {
                'stop_loss': pivot_points.get('r1', current_price * 1.01),
                'take_profit_1': pivot_points.get('s1', current_price * 0.98),
                'take_profit_2': pivot_points.get('s2', current_price * 0.97),
                'take_profit_3': pivot_points.get('s3', current_price * 0.96)
            }
            
            # Method 5: Fibonacci-based
            fib = self.calculate_fibonacci_retracement(df=None)
            methods['fibonacci'] = {
                'stop_loss': fib.get('61.8%', current_price * 1.01),
                'take_profit_1': fib.get('78.6%', current_price * 0.98),
                'take_profit_2': fib.get('100% (low)', current_price * 0.97),
                'take_profit_3': current_price * 0.96
            }
        
        return methods
    
    def calculate_pivot_points(self, df: pd.DataFrame) -> Dict[str, float]:
        """Calculate pivot points for current day."""
        last_candle = df.iloc[-1]
        high = last_candle['high']
        low = last_candle['low']
        close = last_candle['close']
        
        pivot = (high + low + close) / 3
        r1 = (2 * pivot) - low
        r2 = pivot + (high - low)
        r3 = high + 2 * (pivot - low)
        s1 = (2 * pivot) - high
        s2 = pivot - (high - low)
        s3 = low - 2 * (high - pivot)
        
        return {
            'pivot': pivot,
            'r1': r1, 'r2': r2, 'r3': r3,
            's1': s1, 's2': s2, 's3': s3
        }
    
    def generate_signals(
        self, 
        df: pd.DataFrame,
        symbol: str
    ) -> Dict:
        """Generate trading signals with coordinates using all available indicators."""
        
        # Calculate all indicators
        sma_20 = self.calculate_sma(df, 20)
        sma_50 = self.calculate_sma(df, 50)
        sma_200 = self.calculate_sma(df, 200)
        ema_20 = self.calculate_ema(df, 20)
        ema_50 = self.calculate_ema(df, 50)
        rsi = self.calculate_rsi(df, 14)
        macd, signal, histogram = self.calculate_macd(df)
        upper_bb, middle_bb, lower_bb = self.calculate_bollinger_bands(df)
        atr = self.calculate_atr(df, 14)
        
        # Additional indicators
        stoch_k, stoch_d = self.calculate_stochastic(df)
        cci = self.calculate_cci(df)
        adx, plus_di, minus_di = self.calculate_adx(df)
        williams_r = self.calculate_williams_r(df)
        parabolic_sar = self.calculate_parabolic_sar(df)
        ichimoku = self.calculate_ichimoku(df)
        mfi = self.calculate_mfi(df)
        obv = self.calculate_obv(df)
        upper_kc, middle_kc, lower_kc = self.calculate_keltner_channels(df)
        upper_dc, lower_dc = self.calculate_donchian_channels(df)
        
        # Get current price
        current_price = df['close'].iloc[-1]
        
        # Find support/resistance
        support, resistance = self.find_support_resistance(df)
        
        # Calculate pivot points
        pivots = self.calculate_pivot_points(df)
        
        # Detect candlestick patterns
        patterns = self.detect_candlestick_patterns(df)
        
        # Calculate Fibonacci retracement
        fib = self.calculate_fibonacci_retracement(df)
        
        # Calculate SL/TP using multiple methods
        sl_tp_methods = self.calculate_sl_tp_methods(
            current_price, "BUY", atr.iloc[-1], support, resistance, pivots
        )
        
        # Initialize weighted signal scores (higher weight = more important)
        buy_signals = 0
        sell_signals = 0
        signal_details = []
        
        # === TREND ANALYSIS (Weight: 3) ===
        if sma_20.iloc[-1] > sma_50.iloc[-1] and sma_50.iloc[-1] > sma_200.iloc[-1]:
            buy_signals += 3
            signal_details.append("Strong Uptrend: SMA 20 > SMA 50 > SMA 200")
        elif sma_20.iloc[-1] < sma_50.iloc[-1] and sma_50.iloc[-1] < sma_200.iloc[-1]:
            sell_signals += 3
            signal_details.append("Strong Downtrend: SMA 20 < SMA 50 < SMA 200")
        elif sma_20.iloc[-1] > sma_50.iloc[-1]:
            buy_signals += 1
            signal_details.append("Moderate Uptrend: SMA 20 > SMA 50")
        else:
            sell_signals += 1
            signal_details.append("Moderate Downtrend: SMA 20 < SMA 50")
        
        # === RSI ANALYSIS (Weight: 2) ===
        if rsi.iloc[-1] < 20:
            buy_signals += 2
            signal_details.append(f"RSI Extremely Oversold ({rsi.iloc[-1]:.2f})")
        elif rsi.iloc[-1] < 30:
            buy_signals += 2
            signal_details.append(f"RSI Oversold ({rsi.iloc[-1]:.2f})")
        elif rsi.iloc[-1] > 80:
            sell_signals += 2
            signal_details.append(f"RSI Extremely Overbought ({rsi.iloc[-1]:.2f})")
        elif rsi.iloc[-1] > 70:
            sell_signals += 2
            signal_details.append(f"RSI Overbought ({rsi.iloc[-1]:.2f})")
        elif 40 < rsi.iloc[-1] < 60:
            signal_details.append(f"RSI Neutral ({rsi.iloc[-1]:.2f})")
        
        # === MACD ANALYSIS (Weight: 2) ===
        if macd.iloc[-1] > signal.iloc[-1] and histogram.iloc[-1] > 0 and histogram.iloc[-2] < 0:
            buy_signals += 2
            signal_details.append("MACD Bullish Crossover (Strong)")
        elif macd.iloc[-1] > signal.iloc[-1] and histogram.iloc[-1] > 0:
            buy_signals += 1
            signal_details.append("MACD Bullish")
        elif macd.iloc[-1] < signal.iloc[-1] and histogram.iloc[-1] < 0 and histogram.iloc[-2] > 0:
            sell_signals += 2
            signal_details.append("MACD Bearish Crossover (Strong)")
        elif macd.iloc[-1] < signal.iloc[-1] and histogram.iloc[-1] < 0:
            sell_signals += 1
            signal_details.append("MACD Bearish")
        
        # === STOCHASTIC ANALYSIS (Weight: 2) ===
        if stoch_k.iloc[-1] < 20 and stoch_d.iloc[-1] < 20:
            buy_signals += 2
            signal_details.append(f"Stochastic Oversold (K: {stoch_k.iloc[-1]:.2f}, D: {stoch_d.iloc[-1]:.2f})")
        elif stoch_k.iloc[-1] > 80 and stoch_d.iloc[-1] > 80:
            sell_signals += 2
            signal_details.append(f"Stochastic Overbought (K: {stoch_k.iloc[-1]:.2f}, D: {stoch_d.iloc[-1]:.2f})")
        elif stoch_k.iloc[-1] > stoch_d.iloc[-1] and stoch_k.iloc[-2] < stoch_d.iloc[-2]:
            buy_signals += 1
            signal_details.append("Stochastic Bullish Crossover")
        elif stoch_k.iloc[-1] < stoch_d.iloc[-1] and stoch_k.iloc[-2] > stoch_d.iloc[-2]:
            sell_signals += 1
            signal_details.append("Stochastic Bearish Crossover")
        
        # === CCI ANALYSIS (Weight: 1) ===
        if cci.iloc[-1] < -200:
            buy_signals += 1
            signal_details.append(f"CCI Oversold ({cci.iloc[-1]:.2f})")
        elif cci.iloc[-1] > 200:
            sell_signals += 1
            signal_details.append(f"CCI Overbought ({cci.iloc[-1]:.2f})")
        
        # === ADX ANALYSIS (Weight: 1 for trend strength) ===
        if adx.iloc[-1] > 40:
            if plus_di.iloc[-1] > minus_di.iloc[-1]:
                buy_signals += 1
                signal_details.append(f"Strong Uptrend (ADX: {adx.iloc[-1]:.2f})")
            else:
                sell_signals += 1
                signal_details.append(f"Strong Downtrend (ADX: {adx.iloc[-1]:.2f})")
        elif adx.iloc[-1] < 20:
            signal_details.append(f"Weak Trend (ADX: {adx.iloc[-1]:.2f})")
        
        # === WILLIAMS %R ANALYSIS (Weight: 1) ===
        if williams_r.iloc[-1] < -80:
            buy_signals += 1
            signal_details.append(f"Williams %R Oversold ({williams_r.iloc[-1]:.2f})")
        elif williams_r.iloc[-1] > -20:
            sell_signals += 1
            signal_details.append(f"Williams %R Overbought ({williams_r.iloc[-1]:.2f})")
        
        # === PARABOLIC SAR ANALYSIS (Weight: 2) ===
        if current_price > parabolic_sar.iloc[-1]:
            buy_signals += 2
            signal_details.append("Price above Parabolic SAR (Bullish)")
        else:
            sell_signals += 2
            signal_details.append("Price below Parabolic SAR (Bearish)")
        
        # === ICHIMOKU ANALYSIS (Weight: 2) ===
        if (current_price > ichimoku['senkou_span_a'].iloc[-1] and 
            current_price > ichimoku['senkou_span_b'].iloc[-1]):
            buy_signals += 2
            signal_details.append("Price above Ichimoku Cloud (Bullish)")
        elif (current_price < ichimoku['senkou_span_a'].iloc[-1] and 
              current_price < ichimoku['senkou_span_b'].iloc[-1]):
            sell_signals += 2
            signal_details.append("Price below Ichimoku Cloud (Bearish)")
        
        if ichimoku['tenkan_sen'].iloc[-1] > ichimoku['kijun_sen'].iloc[-1]:
            buy_signals += 1
            signal_details.append("Tenkan-sen above Kijun-sen (Bullish)")
        else:
            sell_signals += 1
            signal_details.append("Tenkan-sen below Kijun-sen (Bearish)")
        
        # === MFI ANALYSIS (Weight: 1) ===
        if mfi.iloc[-1] < 20:
            buy_signals += 1
            signal_details.append(f"MFI Oversold ({mfi.iloc[-1]:.2f})")
        elif mfi.iloc[-1] > 80:
            sell_signals += 1
            signal_details.append(f"MFI Overbought ({mfi.iloc[-1]:.2f})")
        
        # === BOLLINGER BANDS ANALYSIS (Weight: 1) ===
        if current_price < lower_bb.iloc[-1]:
            buy_signals += 1
            signal_details.append("Price below Lower Bollinger Band")
        elif current_price > upper_bb.iloc[-1]:
            sell_signals += 1
            signal_details.append("Price above Upper Bollinger Band")
        
        # === KELTNER CHANNELS ANALYSIS (Weight: 1) ===
        if current_price < lower_kc.iloc[-1]:
            buy_signals += 1
            signal_details.append("Price below Lower Keltner Channel")
        elif current_price > upper_kc.iloc[-1]:
            sell_signals += 1
            signal_details.append("Price above Upper Keltner Channel")
        
        # === DONCHIAN CHANNELS ANALYSIS (Weight: 1) ===
        if current_price > upper_dc.iloc[-1]:
            buy_signals += 1
            signal_details.append("Price breakout above Donchian Channel")
        elif current_price < lower_dc.iloc[-1]:
            sell_signals += 1
            signal_details.append("Price breakdown below Donchian Channel")
        
        # === PRICE vs EMA ANALYSIS (Weight: 1) ===
        if current_price > ema_20.iloc[-1] and current_price > ema_50.iloc[-1]:
            buy_signals += 1
            signal_details.append("Price above EMA 20 and EMA 50")
        elif current_price < ema_20.iloc[-1] and current_price < ema_50.iloc[-1]:
            sell_signals += 1
            signal_details.append("Price below EMA 20 and EMA 50")
        
        # === PIVOT POINT ANALYSIS (Weight: 1) ===
        if current_price < pivots['s2']:
            buy_signals += 1
            signal_details.append("Price below Support 2 (Strong Buy Zone)")
        elif current_price < pivots['s1']:
            buy_signals += 1
            signal_details.append("Price below Support 1")
        elif current_price > pivots['r2']:
            sell_signals += 1
            signal_details.append("Price above Resistance 2 (Strong Sell Zone)")
        elif current_price > pivots['r1']:
            sell_signals += 1
            signal_details.append("Price above Resistance 1")
        
        # === CANDLESTICK PATTERNS (Weight: 2) ===
        for pattern_name, pattern_desc in patterns.items():
            if 'bullish' in pattern_desc.lower():
                buy_signals += 2
                signal_details.append(f"Pattern: {pattern_desc}")
            elif 'bearish' in pattern_desc.lower():
                sell_signals += 2
                signal_details.append(f"Pattern: {pattern_desc}")
            else:
                signal_details.append(f"Pattern: {pattern_desc}")
        
        # Calculate overall signal
        total_signals = buy_signals + sell_signals
        if total_signals == 0:
            overall_signal = "HOLD"
            confidence = 0
        elif buy_signals > sell_signals:
            overall_signal = "BUY"
            confidence = (buy_signals / total_signals) * 100
        elif sell_signals > buy_signals:
            overall_signal = "SELL"
            confidence = (sell_signals / total_signals) * 100
        else:
            overall_signal = "HOLD"
            confidence = 50
        
        # Determine best SL/TP method based on volatility and market conditions
        atr_value = atr.iloc[-1]
        atr_pct = (atr_value / current_price) * 100
        
        if atr_pct > 1.5:  # High volatility - use wider stops
            best_method = 'atr'
        elif support and resistance:  # Clear levels - use S/R
            best_method = 'support_resistance'
        else:  # Default to pivot points
            best_method = 'pivot_points'
        
        # Get coordinates from best method
        if overall_signal == "BUY":
            sl_tp_methods = self.calculate_sl_tp_methods(
                current_price, "BUY", atr_value, support, resistance, pivots
            )
        elif overall_signal == "SELL":
            sl_tp_methods = self.calculate_sl_tp_methods(
                current_price, "SELL", atr_value, support, resistance, pivots
            )
        else:
            sl_tp_methods = {}
        
        best_coords = sl_tp_methods.get(best_method, {})
        
        # Risk/Reward ratio
        if best_coords.get('stop_loss') and best_coords.get('take_profit_1'):
            risk = abs(current_price - best_coords['stop_loss'])
            reward = abs(best_coords['take_profit_1'] - current_price)
            risk_reward = reward / risk if risk > 0 else 0
        else:
            risk_reward = 0
        
        return {
            'symbol': symbol,
            'timestamp': datetime.now().isoformat(),
            'current_price': current_price,
            'signal': overall_signal,
            'confidence': round(confidence, 2),
            'signal_details': signal_details,
            'buy_signals': buy_signals,
            'sell_signals': sell_signals,
            'coordinates': {
                'entry': round(current_price, 5),
                'stop_loss': round(best_coords.get('stop_loss', 0), 5) if best_coords.get('stop_loss') else None,
                'take_profit_1': round(best_coords.get('take_profit_1', 0), 5) if best_coords.get('take_profit_1') else None,
                'take_profit_2': round(best_coords.get('take_profit_2', 0), 5) if best_coords.get('take_profit_2') else None,
                'take_profit_3': round(best_coords.get('take_profit_3', 0), 5) if best_coords.get('take_profit_3') else None,
                'method_used': best_method
            },
            'risk_reward_ratio': round(risk_reward, 2),
            'all_sl_tp_methods': {
                k: {kk: round(vv, 5) if isinstance(vv, float) else vv for kk, vv in v.items()}
                for k, v in sl_tp_methods.items()
            },
            'indicators': {
                'sma_20': round(sma_20.iloc[-1], 5),
                'sma_50': round(sma_50.iloc[-1], 5),
                'sma_200': round(sma_200.iloc[-1], 5),
                'ema_20': round(ema_20.iloc[-1], 5),
                'ema_50': round(ema_50.iloc[-1], 5),
                'rsi': round(rsi.iloc[-1], 2),
                'macd': round(macd.iloc[-1], 5),
                'macd_signal': round(signal.iloc[-1], 5),
                'macd_histogram': round(histogram.iloc[-1], 5),
                'stoch_k': round(stoch_k.iloc[-1], 2),
                'stoch_d': round(stoch_d.iloc[-1], 2),
                'cci': round(cci.iloc[-1], 2),
                'adx': round(adx.iloc[-1], 2),
                'plus_di': round(plus_di.iloc[-1], 2),
                'minus_di': round(minus_di.iloc[-1], 2),
                'williams_r': round(williams_r.iloc[-1], 2),
                'parabolic_sar': round(parabolic_sar.iloc[-1], 5),
                'mfi': round(mfi.iloc[-1], 2),
                'upper_bb': round(upper_bb.iloc[-1], 5),
                'middle_bb': round(middle_bb.iloc[-1], 5),
                'lower_bb': round(lower_bb.iloc[-1], 5),
                'upper_kc': round(upper_kc.iloc[-1], 5),
                'middle_kc': round(middle_kc.iloc[-1], 5),
                'lower_kc': round(lower_kc.iloc[-1], 5),
                'upper_dc': round(upper_dc.iloc[-1], 5),
                'lower_dc': round(lower_dc.iloc[-1], 5),
                'atr': round(atr_value, 5),
                'atr_pct': round(atr_pct, 2)
            },
            'ichimoku': {
                'tenkan_sen': round(ichimoku['tenkan_sen'].iloc[-1], 5),
                'kijun_sen': round(ichimoku['kijun_sen'].iloc[-1], 5),
                'senkou_span_a': round(ichimoku['senkou_span_a'].iloc[-1], 5),
                'senkou_span_b': round(ichimoku['senkou_span_b'].iloc[-1], 5)
            },
            'candlestick_patterns': patterns,
            'support_levels': [round(s, 5) for s in support],
            'resistance_levels': [round(r, 5) for r in resistance],
            'pivot_points': {k: round(v, 5) for k, v in pivots.items()},
            'fibonacci_levels': {k: round(v, 5) for k, v in fib.items()}
        }
    
    def analyze_symbol(
        self, 
        symbol: str, 
        asset_type: str = "forex"
    ) -> Dict:
        """Analyze a symbol and generate trading signals."""
        try:
            # Get historical data
            if asset_type == "forex":
                from_curr, to_curr = symbol.split("/")
                df = self.data_service.alpha_vantage.get_forex_daily(from_curr, to_curr)
            else:
                df = self.data_service.alpha_vantage.get_commodity_daily(symbol)
            
            # Need at least 100 candles for analysis
            if len(df) < 100:
                raise ValueError("Insufficient data for analysis")
            
            # Generate signals
            signals = self.generate_signals(df, symbol)
            
            return signals
        
        except Exception as e:
            raise Exception(f"Error analyzing {symbol}: {str(e)}")
    
    def analyze_multiple_symbols(
        self, 
        symbols: List[str], 
        asset_type: str = "forex"
    ) -> List[Dict]:
        """Analyze multiple symbols and return signals."""
        results = []
        for symbol in symbols:
            try:
                analysis = self.analyze_symbol(symbol, asset_type)
                results.append(analysis)
            except Exception as e:
                print(f"Error analyzing {symbol}: {str(e)}")
        
        return results
    
    def get_best_opportunities(
        self, 
        asset_type: str = "forex",
        min_confidence: float = 60.0
    ) -> List[Dict]:
        """Get the best trading opportunities based on confidence."""
        if asset_type == "forex":
            symbols = self.data_service.settings.FOREX_PAIRS
        else:
            symbols = self.data_service.settings.COMMODITIES
        
        analyses = self.analyze_multiple_symbols(symbols, asset_type)
        
        # Filter by confidence and sort
        opportunities = [
            a for a in analyses 
            if a['confidence'] >= min_confidence and a['signal'] in ['BUY', 'SELL']
        ]
        
        # Sort by confidence descending
        opportunities.sort(key=lambda x: x['confidence'], reverse=True)
        
        return opportunities


# Singleton instance
analysis_service = TechnicalAnalysisService()
