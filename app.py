from flask import Flask, render_template, jsonify  # Flask 웹 프레임워크와 필요한 함수 import
import yfinance as yf  # Yahoo Finance 데이터 가져오기 위한 라이브러리
import pandas as pd  # 데이터 처리를 위한 라이브러리
import pandas_ta as ta  # 기술적 분석 지표 계산을 위한 라이브러리
from datetime import datetime, timedelta  # 날짜 및 시간 관련 기능을 위한 라이브러리 import

app = Flask(__name__)  # Flask 애플리케이션 생성

def fetch_yahoo_data(ticker, interval, ema_period=20, rsi_period=14):
    # 데이터 조회 기간 설정
    end_date = datetime.now()  # 현재 날짜와 시간
    if interval in ['1m', '5m']:  # 분 단위 데이터 조회 시
        start_date = end_date - timedelta(days=7)  # 7일 이전부터 데이터 조회
    elif interval in ['15m', '60m']:  # 15분 또는 1시간 단위 데이터 조회 시
        start_date = end_date - timedelta(days=60)  # 60일 이전부터 데이터 조회
    elif interval == '1d':  # 일 단위 데이터 조회 시
        start_date = end_date - timedelta(days=365*5)  # 5년 이전부터 데이터 조회
    elif interval == '1wk':  # 주 단위 데이터 조회 시
        start_date = end_date - timedelta(weeks=365*5)  # 5년 이전부터 데이터 조회
    elif interval == '1mo':  # 월 단위 데이터 조회 시
        start_date = end_date - timedelta(days=365*5)  # 5년 이전부터 데이터 조회

    # Yahoo Finance에서 데이터 다운로드 및 기술적 분석 지표 계산
    data = yf.download(ticker, start=start_date, end=end_date, interval=interval)
    data['EMA'] = ta.ema(data['Close'], length=ema_period)  # Exponential Moving Average 계산
    data['RSI'] = ta.rsi(data['Close'], length=rsi_period)  # Relative Strength Index 계산

    # 데이터 포맷 변환
    candlestick_data = [
        {
            'time': int(row.Index.timestamp()),
            'open': row.Open,
            'high': row.High,
            'low': row.Low,
            'close': row.Close
        }
        for row in data.itertuples()
    ]

    ema_data = [
        {
            'time': int(row.Index.timestamp()),
            'value': row.EMA
        }
        for row in data.itertuples() if not pd.isna(row.EMA)
    ]

    rsi_data = [
        {
            'time': int(row.Index.timestamp()),
            'value': row.RSI if not pd.isna(row.RSI) else 0  # NaN 값을 0으로 변환
        }
        for row in data.itertuples()
    ]

    return candlestick_data, ema_data, rsi_data

@app.route('/')  # 루트 페이지 요청 처리
def index():
    return render_template('index.html')  # index.html 템플릿 렌더링

@app.route('/api/data/<ticker>/<interval>/<int:ema_period>/<int:rsi_period>')  # 데이터 엔드포인트 요청 처리
def get_data(ticker, interval, ema_period, rsi_period):
    # 사용자가 요청한 주식 데이터 및 기술적 분석 지표 가져오기
    candlestick_data, ema_data, rsi_data = fetch_yahoo_data(ticker, interval, ema_period, rsi_period)
    return jsonify({'candlestick': candlestick_data, 'ema': ema_data, 'rsi': rsi_data})  # JSON 응답 반환

@app.route('/api/symbols')  # 종목 심볼 엔드포인트 요청 처리
def get_symbols():
    with open('symbols.txt') as f:  # 파일에서 종목 심볼 읽어오기
        symbols = [line.strip() for line in f]
    return jsonify(symbols)  # JSON 응답 반환

if __name__ == '__main__':
    app.run(debug=True)  # 개발 서버 실행 https://54.172.196.221:80



