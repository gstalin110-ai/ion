import dash
from dash import dcc, html, Input, Output, State
import plotly.graph_objs as go
import plotly.express as px
import pandas as pd
from datetime import datetime, timedelta
from app.services.data_service import data_service
from app.services.analysis_service import analysis_service
from app.services.alert_service import alert_service, AlertType, AlertChannel
from config.settings import settings

# Initialize Dash app
app = dash.Dash(
    __name__,
    title=settings.APP_NAME,
    suppress_callback_exceptions=True,
    external_stylesheets=[
        "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
    ]
)

# Layout
app.layout = html.Div([
    # Header
    html.Div([
        html.H1(f"{settings.APP_NAME} - Dashboard", className="text-center my-4"),
        html.P(f"Last updated: ", id="last-updated", className="text-center text-muted")
    ], className="container"),
    
    # Main content
    html.Div([
        # Market Overview
        html.Div([
            html.H3("Market Overview", className="mb-3"),
            html.Div(id="market-overview", className="row")
        ], className="container mb-5"),
        
        # Forex Section
        html.Div([
            html.H3("Forex Markets", className="mb-3"),
            html.Div([
                html.Div([
                    html.Label("Select Forex Pair:"),
                    dcc.Dropdown(
                        id="forex-pair-dropdown",
                        options=[{"label": pair, "value": pair} for pair in settings.FOREX_PAIRS],
                        value=settings.FOREX_PAIRS[0]
                    )
                ], className="col-md-4 mb-3"),
                html.Div([
                    html.Label("Time Period:"),
                    dcc.Dropdown(
                        id="forex-period-dropdown",
                        options=[
                            {"label": "1 Month", "value": "1M"},
                            {"label": "3 Months", "value": "3M"},
                            {"label": "6 Months", "value": "6M"},
                            {"label": "1 Year", "value": "1Y"},
                            {"label": "5 Years", "value": "5Y"}
                        ],
                        value="1Y"
                    )
                ], className="col-md-4 mb-3"),
                html.Div([
                    html.Button("Refresh Data", id="refresh-forex-btn", className="btn btn-primary")
                ], className="col-md-4 mb-3 d-flex align-items-end")
            ], className="row"),
            dcc.Graph(id="forex-chart"),
            html.Div(id="forex-stats", className="row mt-3")
        ], className="container mb-5"),
        
        # Commodities Section
        html.Div([
            html.H3("Commodities Markets", className="mb-3"),
            html.Div([
                html.Div([
                    html.Label("Select Commodity:"),
                    dcc.Dropdown(
                        id="commodity-dropdown",
                        options=[{"label": comm, "value": comm} for comm in settings.COMMODITIES],
                        value=settings.COMMODITIES[0]
                    )
                ], className="col-md-4 mb-3"),
                html.Div([
                    html.Label("Time Period:"),
                    dcc.Dropdown(
                        id="commodity-period-dropdown",
                        options=[
                            {"label": "1 Month", "value": "1M"},
                            {"label": "3 Months", "value": "3M"},
                            {"label": "6 Months", "value": "6M"},
                            {"label": "1 Year", "value": "1Y"},
                            {"label": "5 Years", "value": "5Y"}
                        ],
                        value="1Y"
                    )
                ], className="col-md-4 mb-3"),
                html.Div([
                    html.Button("Refresh Data", id="refresh-commodity-btn", className="btn btn-primary")
                ], className="col-md-4 mb-3 d-flex align-items-end")
            ], className="row"),
            dcc.Graph(id="commodity-chart"),
            html.Div(id="commodity-stats", className="row mt-3")
        ], className="container mb-5"),
        
        # Technical Indicators Section
        html.Div([
            html.H3("Technical Indicators", className="mb-3"),
            html.Div([
                html.Div([
                    html.Label("Select Symbol:"),
                    dcc.Dropdown(
                        id="indicator-symbol-dropdown",
                        options=[{"label": pair, "value": pair} for pair in settings.FOREX_PAIRS],
                        value=settings.FOREX_PAIRS[0]
                    )
                ], className="col-md-4 mb-3"),
                html.Div([
                    html.Label("Indicator:"),
                    dcc.Dropdown(
                        id="indicator-dropdown",
                        options=[
                            {"label": "SMA (Simple Moving Average)", "value": "SMA"},
                            {"label": "EMA (Exponential Moving Average)", "value": "EMA"},
                            {"label": "RSI (Relative Strength Index)", "value": "RSI"},
                            {"label": "MACD", "value": "MACD"},
                            {"label": "Bollinger Bands", "value": "BBANDS"}
                        ],
                        value="SMA"
                    )
                ], className="col-md-4 mb-3"),
                html.Div([
                    html.Label("Time Period:"),
                    dcc.Dropdown(
                        id="indicator-period-dropdown",
                        options=[
                            {"label": "7", "value": 7},
                            {"label": "14", "value": 14},
                            {"label": "21", "value": 21},
                            {"label": "50", "value": 50},
                            {"label": "200", "value": 200}
                        ],
                        value=14
                    )
                ], className="col-md-4 mb-3")
            ], className="row"),
            dcc.Graph(id="indicator-chart")
        ], className="container mb-5"),
        
        # Trading Signals Section
        html.Div([
            html.H3("🎯 Trading Signals & Coordinates", className="mb-3"),
            html.Div([
                html.Div([
                    html.Label("Select Symbol to Analyze:"),
                    dcc.Dropdown(
                        id="signal-symbol-dropdown",
                        options=[{"label": pair, "value": pair} for pair in settings.FOREX_PAIRS],
                        value=settings.FOREX_PAIRS[0]
                    )
                ], className="col-md-4 mb-3"),
                html.Div([
                    html.Label("Asset Type:"),
                    dcc.Dropdown(
                        id="signal-asset-type",
                        options=[
                            {"label": "Forex", "value": "forex"},
                            {"label": "Commodity", "value": "commodity"}
                        ],
                        value="forex"
                    )
                ], className="col-md-4 mb-3"),
                html.Div([
                    html.Button("Generate Signal", id="generate-signal-btn", className="btn btn-success")
                ], className="col-md-4 mb-3 d-flex align-items-end")
            ], className="row"),
            html.Div(id="trading-signal-output", className="mt-4")
        ], className="container mb-5"),
        
        # Best Opportunities Section
        html.Div([
            html.H3("🔥 Best Trading Opportunities", className="mb-3"),
            html.Div([
                html.Div([
                    html.Label("Asset Type:"),
                    dcc.Dropdown(
                        id="opportunities-asset-type",
                        options=[
                            {"label": "Forex", "value": "forex"},
                            {"label": "Commodities", "value": "commodity"}
                        ],
                        value="forex"
                    )
                ], className="col-md-4 mb-3"),
                html.Div([
                    html.Label("Minimum Confidence (%):"),
                    dcc.Dropdown(
                        id="min-confidence",
                        options=[
                            {"label": "50%", "value": 50},
                            {"label": "60%", "value": 60},
                            {"label": "70%", "value": 70},
                            {"label": "80%", "value": 80}
                        ],
                        value=60
                    )
                ], className="col-md-4 mb-3"),
                html.Div([
                    html.Button("Find Opportunities", id="find-opportunities-btn", className="btn btn-warning")
                ], className="col-md-4 mb-3 d-flex align-items-end")
            ], className="row"),
            html.Div(id="opportunities-output", className="mt-4")
        ], className="container mb-5"),
        
        # Alert Management Section
        html.Div([
            html.H3("🔔 Alert Management", className="mb-3"),
            html.Div([
                html.Div([
                    html.Label("Symbol:"),
                    dcc.Dropdown(
                        id="alert-symbol-dropdown",
                        options=[{"label": pair, "value": pair} for pair in settings.FOREX_PAIRS],
                        value=settings.FOREX_PAIRS[0]
                    )
                ], className="col-md-3 mb-3"),
                html.Div([
                    html.Label("Asset Type:"),
                    dcc.Dropdown(
                        id="alert-asset-type",
                        options=[
                            {"label": "Forex", "value": "forex"},
                            {"label": "Commodity", "value": "commodity"}
                        ],
                        value="forex"
                    )
                ], className="col-md-3 mb-3"),
                html.Div([
                    html.Label("Alert Type:"),
                    dcc.Dropdown(
                        id="alert-type-dropdown",
                        options=[
                            {"label": "Signal Generated (BUY/SELL)", "value": "signal_generated"},
                            {"label": "Price Above Threshold", "value": "price_above"},
                            {"label": "Price Below Threshold", "value": "price_below"},
                            {"label": "RSI Oversold", "value": "rsi_oversold"},
                            {"label": "RSI Overbought", "value": "rsi_overboought"},
                            {"label": "MACD Crossover", "value": "macd_crossover"},
                            {"label": "Breakout", "value": "breakout"},
                            {"label": "Breakdown", "value": "breakdown"}
                        ],
                        value="signal_generated"
                    )
                ], className="col-md-3 mb-3"),
                html.Div([
                    html.Label("Min Confidence (%):"),
                    dcc.Input(
                        id="alert-confidence",
                        type="number",
                        value=60,
                        min=0,
                        max=100,
                        className="form-control"
                    )
                ], className="col-md-2 mb-3"),
                html.Div([
                    html.Button("Add Alert", id="add-alert-btn", className="btn btn-primary")
                ], className="col-md-1 mb-3 d-flex align-items-end")
            ], className="row"),
            html.Div(id="alert-conditions-output", className="mt-3"),
            html.Hr(),
            html.H4("Recent Alerts", className="mt-4 mb-3"),
            html.Div(id="recent-alerts-output")
        ], className="container mb-5"),
        
        # Auto-refresh interval
        dcc.Interval(
            id="interval-component",
            interval=5*60*1000,  # 5 minutes
            n_intervals=0
        )
    ], className="container-fluid")
])


@app.callback(
    Output("last-updated", "children"),
    Input("interval-component", "n_intervals")
)
def update_last_updated(n):
    """Update the last updated timestamp."""
    return f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"


@app.callback(
    Output("market-overview", "children"),
    Input("interval-component", "n_intervals")
)
def update_market_overview(n):
    """Update market overview with current rates."""
    try:
        overview = data_service.get_market_overview()
        
        cards = []
        
        # Forex cards
        for pair, data in overview.get("forex", {}).items():
            if data:
                rate = data.get("5. Exchange Rate", "N/A")
                bid = data.get("9. Bid Price", "N/A")
                ask = data.get("8. Ask Price", "N/A")
                cards.append(html.Div([
                    html.H5(pair, className="card-title"),
                    html.P(f"Rate: {rate}", className="card-text"),
                    html.P(f"Bid: {bid}", className="card-text small"),
                    html.P(f"Ask: {ask}", className="card-text small")
                ], className="col-md-2 col-sm-4 mb-3"))
        
        # Commodity cards
        for comm, data in overview.get("commodities", {}).items():
            if data:
                price = data.get("price", "N/A")
                cards.append(html.Div([
                    html.H5(comm, className="card-title"),
                    html.P(f"Price: ${price}", className="card-text")
                ], className="col-md-2 col-sm-4 mb-3"))
        
        return cards if cards else html.P("No data available")
    
    except Exception as e:
        return html.P(f"Error loading market overview: {str(e)}")


@app.callback(
    Output("forex-chart", "figure"),
    Output("forex-stats", "children"),
    Input("forex-pair-dropdown", "value"),
    Input("forex-period-dropdown", "value"),
    Input("refresh-forex-btn", "n_clicks"),
    State("forex-chart", "figure")
)
def update_forex_chart(pair, period, n_clicks, current_figure):
    """Update forex chart based on selected pair and period."""
    try:
        # Get historical data
        from_curr, to_curr = pair.split("/")
        df = data_service.alpha_vantage.get_forex_daily(from_curr, to_curr)
        
        # Filter by period
        period_map = {
            "1M": timedelta(days=30),
            "3M": timedelta(days=90),
            "6M": timedelta(days=180),
            "1Y": timedelta(days=365),
            "5Y": timedelta(days=365*5)
        }
        
        cutoff_date = datetime.now() - period_map.get(period, timedelta(days=365))
        df = df[df.index >= cutoff_date]
        
        # Create candlestick chart
        fig = go.Figure(data=[go.Candlestick(
            x=df.index,
            open=df['open'],
            high=df['high'],
            low=df['low'],
            close=df['close'],
            name=pair
        )])
        
        fig.update_layout(
            title=f"{pair} - {period}",
            xaxis_title="Date",
            yaxis_title="Price",
            template="plotly_dark",
            height=500
        )
        
        # Calculate stats
        current_price = df['close'].iloc[-1]
        change = df['close'].iloc[-1] - df['close'].iloc[0]
        change_pct = (change / df['close'].iloc[0]) * 100
        high = df['high'].max()
        low = df['low'].min()
        
        stats = html.Div([
            html.Div([
                html.H6("Current Price"),
                html.P(f"{current_price:.4f}", className="h4")
            ], className="col-md-3"),
            html.Div([
                html.H6("Change"),
                html.P(f"{change:+.4f} ({change_pct:+.2f}%)", 
                      className="h4 text-success" if change > 0 else "text-danger")
            ], className="col-md-3"),
            html.Div([
                html.H6("High"),
                html.P(f"{high:.4f}", className="h4")
            ], className="col-md-3"),
            html.Div([
                html.H6("Low"),
                html.P(f"{low:.4f}", className="h4")
            ], className="col-md-3")
        ])
        
        return fig, stats
    
    except Exception as e:
        empty_fig = go.Figure()
        empty_fig.update_layout(title=f"Error: {str(e)}")
        return empty_fig, html.P(f"Error loading data: {str(e)}")


@app.callback(
    Output("commodity-chart", "figure"),
    Output("commodity-stats", "children"),
    Input("commodity-dropdown", "value"),
    Input("commodity-period-dropdown", "value"),
    Input("refresh-commodity-btn", "n_clicks")
)
def update_commodity_chart(symbol, period, n_clicks):
    """Update commodity chart based on selected symbol and period."""
    try:
        # Get historical data
        df = data_service.alpha_vantage.get_commodity_daily(symbol)
        
        # Filter by period
        period_map = {
            "1M": timedelta(days=30),
            "3M": timedelta(days=90),
            "6M": timedelta(days=180),
            "1Y": timedelta(days=365),
            "5Y": timedelta(days=365*5)
        }
        
        cutoff_date = datetime.now() - period_map.get(period, timedelta(days=365))
        df = df[df.index >= cutoff_date]
        
        # Create candlestick chart
        fig = go.Figure(data=[go.Candlestick(
            x=df.index,
            open=df['open'],
            high=df['high'],
            low=df['low'],
            close=df['close'],
            name=symbol
        )])
        
        fig.update_layout(
            title=f"{symbol} - {period}",
            xaxis_title="Date",
            yaxis_title="Price (USD)",
            template="plotly_dark",
            height=500
        )
        
        # Calculate stats
        current_price = df['close'].iloc[-1]
        change = df['close'].iloc[-1] - df['close'].iloc[0]
        change_pct = (change / df['close'].iloc[0]) * 100
        high = df['high'].max()
        low = df['low'].min()
        
        stats = html.Div([
            html.Div([
                html.H6("Current Price"),
                html.P(f"${current_price:.2f}", className="h4")
            ], className="col-md-3"),
            html.Div([
                html.H6("Change"),
                html.P(f"{change:+.2f} ({change_pct:+.2f}%)", 
                      className="h4 text-success" if change > 0 else "text-danger")
            ], className="col-md-3"),
            html.Div([
                html.H6("High"),
                html.P(f"${high:.2f}", className="h4")
            ], className="col-md-3"),
            html.Div([
                html.H6("Low"),
                html.P(f"${low:.2f}", className="h4")
            ], className="col-md-3")
        ])
        
        return fig, stats
    
    except Exception as e:
        empty_fig = go.Figure()
        empty_fig.update_layout(title=f"Error: {str(e)}")
        return empty_fig, html.P(f"Error loading data: {str(e)}")


@app.callback(
    Output("indicator-chart", "figure"),
    Input("indicator-symbol-dropdown", "value"),
    Input("indicator-dropdown", "value"),
    Input("indicator-period-dropdown", "value")
)
def update_indicator_chart(symbol, indicator, period):
    """Update technical indicator chart."""
    try:
        from_curr, to_curr = symbol.split("/")
        
        # Get indicator data
        df = data_service.alpha_vantage.get_technical_indicator(
            from_curr + to_curr,
            indicator,
            time_period=period
        )
        
        # Get price data for context
        price_df = data_service.alpha_vantage.get_forex_daily(from_curr, to_curr)
        price_df = price_df.tail(len(df))
        
        # Create figure
        fig = go.Figure()
        
        # Add price line
        fig.add_trace(go.Scatter(
            x=price_df.index,
            y=price_df['close'],
            mode='lines',
            name='Price',
            yaxis='y'
        ))
        
        # Add indicator
        indicator_col = df.columns[0]
        fig.add_trace(go.Scatter(
            x=df.index,
            y=df[indicator_col],
            mode='lines',
            name=indicator,
            yaxis='y2'
        ))
        
        fig.update_layout(
            title=f"{symbol} - {indicator} ({period} period)",
            xaxis_title="Date",
            yaxis=dict(title="Price"),
            yaxis2=dict(title=indicator, overlaying='y', side='right'),
            template="plotly_dark",
            height=500
        )
        
        return fig
    
    except Exception as e:
        empty_fig = go.Figure()
        empty_fig.update_layout(title=f"Error: {str(e)}")
        return empty_fig


@app.callback(
    Output("signal-symbol-dropdown", "options"),
    Input("signal-asset-type", "value")
)
def update_signal_symbol_options(asset_type):
    """Update symbol dropdown based on asset type."""
    if asset_type == "forex":
        return [{"label": pair, "value": pair} for pair in settings.FOREX_PAIRS]
    else:
        return [{"label": comm, "value": comm} for comm in settings.COMMODITIES]


@app.callback(
    Output("trading-signal-output", "children"),
    Input("generate-signal-btn", "n_clicks"),
    State("signal-symbol-dropdown", "value"),
    State("signal-asset-type", "value")
)
def generate_trading_signal(n_clicks, symbol, asset_type):
    """Generate trading signal with coordinates."""
    if n_clicks is None:
        return html.P("Click 'Generate Signal' to analyze the symbol")
    
    try:
        # Get analysis
        analysis = analysis_service.analyze_symbol(symbol, asset_type)
        
        # Determine signal color
        signal = analysis['signal']
        confidence = analysis['confidence']
        
        if signal == "BUY":
            signal_color = "success"
            signal_icon = "📈"
        elif signal == "SELL":
            signal_color = "danger"
            signal_icon = "📉"
        else:
            signal_color = "warning"
            signal_icon = "⏸️"
        
        # Create signal card
        coords = analysis['coordinates']
        
        return html.Div([
            # Main Signal Card
            html.Div([
                html.Div([
                    html.H4([
                        f"{signal_icon} {signal} SIGNAL",
                        html.Span(f" - {confidence}% Confidence", className="text-muted small")
                    ], className=f"text-{signal_color} mb-3"),
                    
                    html.Div([
                        html.Div([
                            html.H6("Current Price"),
                            html.P(f"{analysis['current_price']:.5f}", className="h3")
                        ], className="col-md-3"),
                        html.Div([
                            html.H6("Entry Price"),
                            html.P(f"{coords['entry']:.5f}", className="h3 text-primary")
                        ], className="col-md-3"),
                        html.Div([
                            html.H6("Stop Loss"),
                            html.P(f"{coords['stop_loss']:.5f}" if coords['stop_loss'] else "N/A", 
                                  className="h3 text-danger")
                        ], className="col-md-3"),
                        html.Div([
                            html.H6("Take Profit 1"),
                            html.P(f"{coords['take_profit_1']:.5f}" if coords['take_profit_1'] else "N/A", 
                                  className="h3 text-success")
                        ], className="col-md-3")
                    ], className="row mb-3"),
                    
                    # Risk/Reward
                    html.Div([
                        html.H6("Risk/Reward Ratio"),
                        html.P(f"1:{analysis['risk_reward_ratio']:.2f}", 
                              className="h4 text-info")
                    ], className="mb-3")
                ], className="card-body")
            ], className="card mb-3"),
            
            # Signal Details
            html.Div([
                html.H5("Signal Details", className="mb-3"),
                html.Ul([
                    html.Li(detail, className="mb-1") for detail in analysis['signal_details']
                ])
            ], className="card p-3 mb-3"),
            
            # Indicators Summary
            html.Div([
                html.H5("Technical Indicators", className="mb-3"),
                html.Div([
                    html.Div([
                        html.H6("RSI"),
                        html.P(f"{analysis['indicators']['rsi']:.2f}", className="h5")
                    ], className="col-md-3"),
                    html.Div([
                        html.H6("MACD"),
                        html.P(f"{analysis['indicators']['macd']:.5f}", className="h5")
                    ], className="col-md-3"),
                    html.Div([
                        html.H6("SMA 20"),
                        html.P(f"{analysis['indicators']['sma_20']:.5f}", className="h5")
                    ], className="col-md-3"),
                    html.Div([
                        html.H6("ATR (Volatility)"),
                        html.P(f"{analysis['indicators']['atr']:.5f}", className="h5")
                    ], className="col-md-3")
                ], className="row")
            ], className="card p-3 mb-3"),
            
            # Support/Resistance
            html.Div([
                html.H5("Support & Resistance Levels", className="mb-3"),
                html.Div([
                    html.Div([
                        html.H6("Support Levels", className="text-success"),
                        html.Ul([
                            html.Li(f"{level:.5f}") for level in analysis['support_levels']
                        ])
                    ], className="col-md-6"),
                    html.Div([
                        html.H6("Resistance Levels", className="text-danger"),
                        html.Ul([
                            html.Li(f"{level:.5f}") for level in analysis['resistance_levels']
                        ])
                    ], className="col-md-6")
                ], className="row")
            ], className="card p-3 mb-3"),
            
            # Pivot Points
            html.Div([
                html.H5("Pivot Points", className="mb-3"),
                html.Div([
                    html.Div([
                        html.H6("Pivot"),
                        html.P(f"{analysis['pivot_points']['pivot']:.5f}", className="h5")
                    ], className="col-md-3"),
                    html.Div([
                        html.H6("R1"),
                        html.P(f"{analysis['pivot_points']['r1']:.5f}", className="h5 text-danger")
                    ], className="col-md-3"),
                    html.Div([
                        html.H6("S1"),
                        html.P(f"{analysis['pivot_points']['s1']:.5f}", className="h5 text-success")
                    ], className="col-md-3"),
                    html.Div([
                        html.H6("R2/S2"),
                        html.P(f"R2: {analysis['pivot_points']['r2']:.5f}<br>S2: {analysis['pivot_points']['s2']:.5f}", 
                              className="small")
                    ], className="col-md-3")
                ], className="row")
            ], className="card p-3"),
            
            html.P(f"Analysis generated at: {analysis['timestamp']}", className="text-muted small mt-3")
        ])
    
    except Exception as e:
        return html.Div([
            html.H4("Error generating signal", className="text-danger"),
            html.P(str(e))
        ])


@app.callback(
    Output("opportunities-output", "children"),
    Input("find-opportunities-btn", "n_clicks"),
    State("opportunities-asset-type", "value"),
    State("min-confidence", "value")
)
def find_opportunities(n_clicks, asset_type, min_confidence):
    """Find best trading opportunities."""
    if n_clicks is None:
        return html.P("Click 'Find Opportunities' to scan the market")
    
    try:
        opportunities = analysis_service.get_best_opportunities(asset_type, min_confidence)
        
        if not opportunities:
            return html.Div([
                html.H4("No High-Confidence Opportunities Found", className="text-warning"),
                html.P(f"Try lowering the minimum confidence threshold below {min_confidence}%")
            ])
        
        # Create opportunity cards
        cards = []
        for opp in opportunities:
            signal = opp['signal']
            signal_color = "success" if signal == "BUY" else "danger"
            signal_icon = "📈" if signal == "BUY" else "📉"
            coords = opp['coordinates']
            
            cards.append(html.Div([
                html.Div([
                    html.Div([
                        html.H5([
                            f"{signal_icon} {opp['symbol']}",
                            html.Span(f" - {signal}", className=f"badge bg-{signal_color}")
                        ], className="card-title"),
                        html.P(f"Confidence: {opp['confidence']}%", className="card-text"),
                        html.Hr(),
                        html.Div([
                            html.P(f"Entry: {coords['entry']:.5f}", className="mb-1"),
                            html.P(f"Stop Loss: {coords['stop_loss']:.5f}" if coords['stop_loss'] else "", 
                                  className="mb-1 text-danger"),
                            html.P(f"TP1: {coords['take_profit_1']:.5f}" if coords['take_profit_1'] else "", 
                                  className="mb-1 text-success"),
                            html.P(f"Risk/Reward: 1:{opp['risk_reward_ratio']:.2f}", className="small text-muted")
                        ])
                    ], className="card-body")
                ], className="card")
            ], className="col-md-4 mb-3"))
        
        return html.Div([
            html.H4(f"Found {len(opportunities)} Opportunity(ies)", className="mb-3"),
            html.Div(cards, className="row")
        ])
    
    except Exception as e:
        return html.Div([
            html.H4("Error finding opportunities", className="text-danger"),
            html.P(str(e))
        ])


@app.callback(
    Output("alert-symbol-dropdown", "options"),
    Input("alert-asset-type", "value")
)
def update_alert_symbol_options(asset_type):
    """Update symbol dropdown based on asset type."""
    if asset_type == "forex":
        return [{"label": pair, "value": pair} for pair in settings.FOREX_PAIRS]
    else:
        return [{"label": comm, "value": comm} for comm in settings.COMMODITIES]


@app.callback(
    Output("alert-conditions-output", "children"),
    Input("add-alert-btn", "n_clicks"),
    State("alert-symbol-dropdown", "value"),
    State("alert-asset-type", "value"),
    State("alert-type-dropdown", "value"),
    State("alert-confidence", "value")
)
def add_alert_condition(n_clicks, symbol, asset_type, alert_type, confidence):
    """Add a new alert condition."""
    if n_clicks is None:
        return html.P("Configure alert settings and click 'Add Alert'")
    
    try:
        alert_type_enum = AlertType(alert_type)
        condition = alert_service.add_alert_condition(
            symbol=symbol,
            asset_type=asset_type,
            alert_type=alert_type_enum,
            confidence_min=confidence,
            channels=[AlertChannel.DASHBOARD]
        )
        
        conditions = alert_service.get_alert_conditions()
        
        return html.Div([
            html.Div([
                html.H5("✅ Alert Added Successfully", className="text-success mb-3"),
                html.P(f"Symbol: {symbol} | Type: {alert_type} | Min Confidence: {confidence}%")
            ], className="alert alert-success"),
            html.H5("Active Alert Conditions", className="mt-4"),
            html.Table([
                html.Thead([
                    html.Tr([
                        html.Th("Symbol"),
                        html.Th("Type"),
                        html.Th("Min Confidence"),
                        html.Th("Status")
                    ])
                ]),
                html.Tbody([
                    html.Tr([
                        html.Td(c['symbol']),
                        html.Td(c['alert_type']),
                        html.Td(f"{c['confidence_min']}%"),
                        html.Td(html.Span("Active", className="badge bg-success"))
                    ]) for c in conditions
                ])
            ], className="table table-striped")
        ])
    
    except Exception as e:
        return html.Div([
            html.H5("Error Adding Alert", className="text-danger"),
            html.P(str(e))
        ])


@app.callback(
    Output("recent-alerts-output", "children"),
    Input("interval-component", "n_intervals")
)
def update_recent_alerts(n):
    """Update recent alerts display."""
    try:
        alerts = alert_service.get_active_alerts()
        
        if not alerts:
            return html.P("No recent alerts", className="text-muted")
        
        alert_items = []
        for alert in alerts[-10:]:  # Last 10 alerts
            alert_items.append(html.Div([
                html.Div([
                    html.H6(f"{alert['symbol']} - {alert['message']}", className="mb-1"),
                    html.P(f"Time: {alert['timestamp']}", className="small text-muted mb-2"),
                    html.P(f"Data: {alert['data']}", className="small")
                ], className="card-body")
            ], className="card mb-2"))
        
        return html.Div(alert_items)
    
    except Exception as e:
        return html.P(f"Error loading alerts: {str(e)}")


if __name__ == "__main__":
    app.run(
        host=settings.DASHBOARD_HOST,
        port=settings.DASHBOARD_PORT,
        debug=settings.DEBUG
    )
