# kis_price.py

import datetime
import requests
import os
import sys
import pandas as pd
from io import StringIO

sys.path.append(os.path.join(os.path.dirname(__file__), "open_trading_api", "open_trading_api"))
from open_trading_api.rest.kis_auth import auth as kis_auth, getTREnv

# 종목명 → 코드 매핑
def get_kospi_code_dict():
    url = "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download"
    res = requests.get(url)
    res.encoding = 'euc-kr'
    df = pd.read_html(StringIO(res.text))[0]
    df = df[['회사명', '종목코드']]
    df['종목코드'] = df['종목코드'].astype(str).str.zfill(6)
    return dict(zip(df['회사명'], df['종목코드']))

def get_token():
    kis_auth("prod")
    return getTREnv().my_token.replace("Bearer ", "")

# 국내 주식 현재가 조회
def get_korea_price(code):
    token = get_token()
    env = getTREnv()

    headers = {
        "authorization": f"Bearer {token}",
        "appkey": env.my_app,
        "appsecret": env.my_sec,
        "tr_id": "FHKST01010100"
    }

    params = {
        "fid_cond_mrkt_div_code": "J",
        "fid_input_iscd": code
    }

    url = f"{env.my_url}/uapi/domestic-stock/v1/quotations/inquire-price"
    res = requests.get(url, headers=headers, params=params)
    data = res.json()

    output = data.get("output", {})
    return {
        "price": int(output.get("stck_prpr", 0)),
        "time": datetime.datetime.now().strftime("%H:%M:%S")
    }

# 해외 주식 현재가 조회
def get_overseas_price(itm_no, excd="NAS"):
    token = get_token()
    env = getTREnv()

    headers = {
        "authorization": f"Bearer {token}",
        "appkey": env.my_app,
        "appsecret": env.my_sec,
        "tr_id": "HHDFS00000300"
    }

    params = {
        "AUTH": "",
        "EXCD": excd,
        "SYMB": itm_no
    }

    url = f"{env.my_url}/uapi/overseas-price/v1/quotations/price"
    res = requests.get(url, headers=headers, params=params)
    data = res.json()

    output = data.get("output", {})
    return {
        "price": float(output.get("last", 0)),
        "name": output.get("itmsNm", itm_no),
        "time": datetime.datetime.now().strftime("%H:%M:%S")
    }
