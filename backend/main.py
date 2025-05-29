# main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import datetime
import pandas as pd
import requests
from typing import Dict
from io import StringIO
import FinanceDataReader as fdr
from open_trading_api.rest.kis_auth import auth as kis_auth, getTREnv
from fastapi.responses import JSONResponse
import numpy as np
import os
from dotenv import load_dotenv
import os
import json
import requests
import asyncio
import websockets
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from base64 import b64decode

app = FastAPI()

# CORS 설정 (프론트 연결용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 필요 시 특정 프론트 주소만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(dotenv_path=env_path)

APP_KEY = os.getenv('KIS_API_KEY')
APP_SECRET = os.getenv('KIS_API_SECRET')
CUST_TYPE = 'P'
WS_URL = 'ws://ops.koreainvestment.com:21000'



def get_approval(key, secret):
    url = 'https://openapi.koreainvestment.com:9443'
    headers = {"content-type": "application/json"}
    body = {
        "grant_type": "client_credentials",
        "appkey": key,
        "secretkey": secret
    }
    PATH = "oauth2/Approval"
    URL = f"{url}/{PATH}"
    res = requests.post(URL, headers=headers, data=json.dumps(body))
    approval_key = res.json()["approval_key"]
    return approval_key

def parse_hoga(data):
    recvvalue = data.split('^')
    return {
        "stock_code": recvvalue[0],
        "sell": [{"price": recvvalue[12 - i], "qty": recvvalue[32 - i]} for i in range(10)],
        "buy":  [{"price": recvvalue[13 + i], "qty": recvvalue[33 + i]} for i in range(10)],
        "sell_total": recvvalue[43],
        "buy_total": recvvalue[44],
        "acc_vol": recvvalue[53]
    }

@app.websocket("/ws/orderbook")
async def websocket_endpoint(websocket: WebSocket, code: str = Query(...)):
    await websocket.accept()
    try:
        approval_key = get_approval(APP_KEY, APP_SECRET)
        async with websockets.connect(WS_URL, ping_interval=None) as kis_ws:
            senddata = {
                "header": {
                    "approval_key": approval_key,
                    "custtype": CUST_TYPE,
                    "tr_type": "1",
                    "content-type": "utf-8"
                },
                "body": {
                    "input": {
                        "tr_id": "H0STASP0",
                        "tr_key": code
                    }
                }
            }
            await kis_ws.send(json.dumps(senddata))
            while True:
                data = await kis_ws.recv()
                if data[0] == '0':
                    recvstr = data.split('|')
                    trid0 = recvstr[1]
                    if trid0 == "H0STASP0":
                        parsed = parse_hoga(recvstr[3])
                        await websocket.send_json({"type": "orderbook", "data": parsed})
    except WebSocketDisconnect:
        print(f"[WebSocket] 클라이언트 연결 종료({code})")
    except Exception as e:
        print(f"에러: {e}")
        await websocket.close()

# ✅ 종목명 → 코드 변환
def get_kospi_code_dict() -> Dict[str, str]:
    url = "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download"
    res = requests.get(url)
    res.encoding = 'euc-kr'
    df = pd.read_html(StringIO(res.text))[0]
    df = df[['회사명', '종목코드']]
    df['종목코드'] = df['종목코드'].astype(str).str.zfill(6)
    return dict(zip(df['회사명'], df['종목코드']))

# ✅ 토큰 발급
def get_token() -> str:
    kis_auth("prod")
    return getTREnv().my_token.replace("Bearer ", "")

# ✅ 실시간 시세 조회
def get_stock_price(code: str) -> Dict[str, str]:
    token = get_token()
    env = getTREnv()
    headers = {
        "authorization": f"Bearer {token}",
        "appkey": env.my_app,
        "appsecret": env.my_sec,
        "tr_id": "FHKST01010100"
    }
    params = {"fid_cond_mrkt_div_code": "J", "fid_input_iscd": code}
    url = f"{env.my_url}/uapi/domestic-stock/v1/quotations/inquire-price"
    res = requests.get(url, headers=headers, params=params)
    data = res.json()
    if "output" not in data or "stck_prpr" not in data["output"]:
        raise ValueError(f"응답 오류: {data}")
    return {
        "price": int(data["output"]["stck_prpr"]),
        "time": datetime.datetime.now().strftime("%H:%M:%S")
    }



# ✅ RSI 계산
def calculate_rsi(df: pd.DataFrame, period: int = 14) -> pd.Series:
    delta = df['Close'].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

# ✅ 10년치 차트 + MA + RSI
def get_10_year_chart_by_fdr(code: str) -> pd.DataFrame:
    end = datetime.datetime.today() 
    start = end - datetime.timedelta(days=365 * 10)
    df = fdr.DataReader(code, start, end)
    df.reset_index(inplace=True)
    df["MA5"] = df["Close"].rolling(window=5).mean()
    df["MA20"] = df["Close"].rolling(window=20).mean()
    df["MA60"] = df["Close"].rolling(window=60).mean()
    df["MA120"] = df["Close"].rolling(window=120).mean()
    df["RSI"] = calculate_rsi(df)
    return df

# ✅ 단기 시세 요약
def get_summary_days(code: str, days: int) -> pd.DataFrame:
    today = datetime.datetime.today()
    start = today - datetime.timedelta(days=days + 5)
    df = fdr.DataReader(code, start, today)
    df = df.tail(days).copy()
    df["날짜"] = df.index.strftime("%Y-%m-%d")
    df["거래대금"] = df["Close"] * df["Volume"]
    df["등락률(%)"] = df["Close"].pct_change().fillna(0) * 100
    df["전일대비"] = df["Close"].diff().fillna(0)
    df = df[["날짜", "Open", "High", "Low", "Close", "전일대비", "등락률(%)", "Volume", "거래대금"]]
    df.columns = ["날짜", "시가", "고가", "저가", "종가", "전일대비", "등락률(%)", "거래량", "거래대금"]
    return df

# ✅ 봉차트용 데이터 (최근 6개월)
def get_candle_data(code: str) -> pd.DataFrame:
    df = fdr.DataReader(code, datetime.datetime.today() - datetime.timedelta(days=180))
    df.reset_index(inplace=True)
    return df

# ✅ 수익률 계산
def calculate_profit(code: str, buy_price: int, quantity: int) -> Dict:
    info = get_stock_price(code)
    current_price = info["price"]
    current_value = current_price * quantity
    purchase_value = buy_price * quantity
    profit = current_value - purchase_value
    rate = (profit / purchase_value) * 100 if purchase_value != 0 else 0
    return {
        "현재가": current_price,
        "총 평가금액": current_value,
        "총 손익": profit,
        "수익률(%)": round(rate, 2)
    }

# ===============================
# ✅ API 엔드포인트들
# ===============================

@app.get("/code")
def get_code(name: str):
    dic = get_kospi_code_dict()
    code = name if name.isdigit() else dic.get(name)
    return {"code": code or "NOT_FOUND"}

@app.get("/price")
def price(code: str):
    return get_stock_price(code)

@app.get("/chart")
def chart(code: str):
    try:
        df = get_10_year_chart_by_fdr(code)

        # ✅ 날짜 문자열로 변환
        df["Date"] = df["Date"].astype(str)

        # ✅ NaN 및 inf 제거 → None 처리 (핵심)
        df = df.replace([np.inf, -np.inf], None)
        df = df.where(df.notnull(), None)

        # ✅ 일부 float → None으로 못 바뀐 경우 강제 제거
        clean_records = []
        for row in df.to_dict(orient="records"):
            for k, v in row.items():
                if isinstance(v, float) and (pd.isna(v) or np.isnan(v)):
                    row[k] = None
            clean_records.append(row)

        return JSONResponse(content=clean_records)

    except Exception as e:
        import traceback
        print("🔥 /chart 오류:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/summary")
def summary(code: str, days: int = 3):
    df = get_summary_days(code, days)
    return df.to_dict(orient="records")

@app.get("/candle")
def candle(code: str):
    df = get_candle_data(code)
    return df.to_dict(orient="records")

@app.get("/profit")
def profit(code: str, buy_price: int, quantity: int):
    return calculate_profit(code, buy_price, quantity)


@app.get("/combined")
def combined_chart(code: str):
    try:
        df = get_candle_data(code)
        df["MA5"] = df["Close"].rolling(window=5).mean()
        df["MA20"] = df["Close"].rolling(window=20).mean()
        df["MA60"] = df["Close"].rolling(window=60).mean()
        df["MA120"] = df["Close"].rolling(window=120).mean()
        df["Date"] = df["Date"].astype(str)
        df = df[["Date", "Open", "High", "Low", "Close", "MA5", "MA20", "MA60", "MA120"]]

        # 1. inf, -inf를 None으로
        df = df.replace([np.inf, -np.inf], None)
        # 2. NaN을 None으로 (where)
        df = df.where(df.notnull(), None)
        # 3. 남은 NaN/inf 강제 변환 (dict 변환 후 수작업)
        clean_records = []
        for row in df.to_dict(orient="records"):
            for k, v in row.items():
                # 만약 float이면서 NaN이라면 None으로
                if isinstance(v, float) and (pd.isna(v) or np.isnan(v)):
                    row[k] = None
            clean_records.append(row)
        return JSONResponse(content=clean_records)
    except Exception as e:
        import traceback
        print("🔥 /combined 오류:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


    
@app.get("/company")
def company():
    try:
        dic = get_kospi_code_dict()
        result = [{"code": code, "name": name} for name, code in dic.items()]
        return {"data": result[:300]}
    except Exception as e:
        import traceback
        print("🔥 /company 오류:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
    
    
    
@app.get("/orderbook")
def orderbook(code: str):
    """
    선택한 종목코드(code)로 한국투자증권 OpenAPI에서 실시간 호가정보(10단계) 반환
    """
    try:
        token = get_token()
        env = getTREnv()
        headers = {
            "authorization": f"Bearer {token}",
            "appkey": KIS_API_KEY,
            "appsecret": KIS_API_SECRET,
            "tr_id": "FHKST01010200"
        }
        params = {
            "fid_cond_mrkt_div_code": "J",  # 코스피/코스닥
            "fid_input_iscd": code          # 여기에 선택된 code가 들어감!
        }
        url = f"{env.my_url}/uapi/domestic-stock/v1/quotations/inquire-ask-price"
        res = requests.get(url, headers=headers, params=params)
        print("🔥 한국투자증권 원본 응답(res.text):", res.text)
        try:
            data = res.json()
        except Exception as e:
            print("🔥 JSON 디코딩 에러! 원본:", res.text)
            return JSONResponse(status_code=500, content={"error": "API JSONDecodeError", "raw": res.text})

        if "output" not in data:
            print("🔥 output 없음! 전체 응답:", data)
            return JSONResponse(status_code=500, content={"error": "한국투자증권 output 없음", "raw": data})

        output = data.get("output", {})

        asks = []
        bids = []
        for i in range(1, 11):
            ask_price = int(output.get(f"askp{i}", 0))
            ask_qty = int(output.get(f"askp_rsqn{i}", 0))
            bid_price = int(output.get(f"bidp{i}", 0))
            bid_qty = int(output.get(f"bidp_rsqn{i}", 0))
            if ask_price > 0:
                asks.append({
                    "price": ask_price,
                    "quantity": ask_qty,
                    "total": ask_price * ask_qty
                })
            if bid_price > 0:
                bids.append({
                    "price": bid_price,
                    "quantity": bid_qty,
                    "total": bid_price * bid_qty
                })

        current_price = int(output.get("stck_prpr", 0))
        price_change = int(output.get("prdy_vrss", 0))
        price_change_percent = float(output.get("prdy_ctrt", 0))

        return {
            "asks": asks[::-1],  # 높은 가격이 위로 오게
            "bids": bids,
            "currentPrice": current_price,
            "priceChange": price_change,
            "priceChangePercent": price_change_percent
        }
    except Exception as e:
        import traceback
        print("🔥 /orderbook 예외:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

