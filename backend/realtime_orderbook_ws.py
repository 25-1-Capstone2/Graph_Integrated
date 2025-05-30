import websockets
import json
import requests
import os
import asyncio
import time
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from base64 import b64decode
from dotenv import load_dotenv
import sys
import traceback

# .env.local 자동 로드
env_path = os.path.join(os.path.dirname(__file__), '..', '.env.local')
load_dotenv(dotenv_path=env_path)

APP_KEY = os.getenv('KIS_API_KEY')
APP_SECRET = os.getenv('KIS_API_SECRET')
HTS_ID = os.getenv('KIS_HTS_ID')
STOCK_CODE = '005930'  # 삼성전자, 필요시 바꿔라
CUST_TYPE = 'P'
WS_URL = 'ws://ops.koreainvestment.com:21000'

# AES256 DECODE
def aes_cbc_base64_dec(key, iv, cipher_text):
    cipher = AES.new(key.encode('utf-8'), AES.MODE_CBC, iv.encode('utf-8'))
    return bytes.decode(unpad(cipher.decrypt(b64decode(cipher_text)), AES.block_size))

# 웹소켓 approval_key 발급
def get_approval(key, secret):
    url = 'https://openapi.koreainvestment.com:9443'
    headers = {"content-type": "application/json"}
    body = {"grant_type": "client_credentials",
            "appkey": key,
            "secretkey": secret}
    PATH = "oauth2/Approval"
    URL = f"{url}/{PATH}"
    time.sleep(0.05)
    res = requests.post(URL, headers=headers, data=json.dumps(body))
    approval_key = res.json()["approval_key"]
    return approval_key

def stockhoka(data):
    recvvalue = data.split('^')
    print(f"\n[호가] 종목코드: {recvvalue[0]}")
    for i in range(10):
        print(f"매도호가{10-i:02d}: {recvvalue[12-i]} | 잔량: {recvvalue[32-i]}")
    for i in range(10):
        print(f"매수호가{1+i:02d}: {recvvalue[13+i]} | 잔량: {recvvalue[33+i]}")
    print(f"총매도호가 잔량: {recvvalue[43]}, 총매수호가 잔량: {recvvalue[44]}")
    print(f"누적거래량: {recvvalue[53]}")

def stockspurchase(data_cnt, data):
    menulist = "유가증권단축종목코드|주식체결시간|주식현재가|전일대비부호|전일대비|전일대비율|가중평균주식가격|주식시가|주식최고가|주식최저가|매도호가1|매수호가1|체결거래량|누적거래량|누적거래대금|매도체결건수|매수체결건수|순매수체결건수|체결강도|총매도수량|총매수수량|체결구분|매수비율|전일거래량대비등락율|시가시간|시가대비구분|시가대비|최고가시간|고가대비구분|고가대비|최저가시간|저가대비구분|저가대비|영업일자|신장운영구분코드|거래정지여부|매도호가잔량|매수호가잔량|총매도호가잔량|총매수호가잔량|거래량회전율|전일동시간누적거래량|전일동시간누적거래량비율|시간구분코드|임의종료구분코드|정적VI발동기준가"
    menustr = menulist.split('|')
    pValue = data.split('^')
    i = 0
    for cnt in range(data_cnt):
        print(f"\n[체결] #{cnt+1}/{data_cnt}")
        for menu in menustr:
            print(f"{menu:>16}: {pValue[i]}")
            i += 1

def stocksigningnotice(data, key, iv):
    aes_dec_str = aes_cbc_base64_dec(key, iv, data)
    pValue = aes_dec_str.split('^')
    print("\n[체결통보]")
    menulist = "고객ID|계좌번호|주문번호|원주문번호|매도매수구분|정정구분|주문종류|주문조건|주식단축종목코드|체결수량|체결단가|주식체결시간|거부여부|체결여부|접수여부|지점번호|주문수량|계좌명|체결종목명|신용구분|신용대출일자|체결종목명40|주문가격"
    menustr1 = menulist.split('|')
    for idx, menu in enumerate(menustr1):
        print(f"{menu:>10}: {pValue[idx]}")

async def connect():
    g_approval_key = get_approval(APP_KEY, APP_SECRET)
    print("approval_key:", g_approval_key)

    async with websockets.connect(WS_URL, ping_interval=None) as websocket:
        print("\n--- 실시간 주문/호가/체결통보 데모 ---")
        print("아래 숫자 중 하나를 입력하세요:")
        print("1. 주식호가 (호가창 실시간)")
        print("2. 주식호가 해제")
        print("3. 주식체결 (실시간 체결 틱)")
        print("4. 주식체결 해제")
        print("5. 주식체결통보 (고객, 체결/정정/취소 등 알림)")
        print("6. 주식체결통보 해제 (고객)")
        print("7. 주식체결통보 (모의)")
        print("8. 주식체결통보 해제 (모의)")
        print("0. 종료\n")
        cmd = input("명령 선택: ").strip()

        # 입력값 체크 및 파라미터 설정
        if cmd == '1': tr_id, tr_type, tr_key = 'H0STASP0', '1', STOCK_CODE
        elif cmd == '2': tr_id, tr_type, tr_key = 'H0STASP0', '2', STOCK_CODE
        elif cmd == '3': tr_id, tr_type, tr_key = 'H0STCNT0', '1', STOCK_CODE
        elif cmd == '4': tr_id, tr_type, tr_key = 'H0STCNT0', '2', STOCK_CODE
        elif cmd == '5': tr_id, tr_type, tr_key = 'H0STCNI0', '1', HTS_ID or input('HTS_ID: ')
        elif cmd == '6': tr_id, tr_type, tr_key = 'H0STCNI0', '2', HTS_ID or input('HTS_ID: ')
        elif cmd == '7': tr_id, tr_type, tr_key = 'H0STCNI9', '1', HTS_ID or input('HTS_ID: ')
        elif cmd == '8': tr_id, tr_type, tr_key = 'H0STCNI9', '2', HTS_ID or input('HTS_ID: ')
        else: print("종료합니다."); return

        senddata = {
            "header": {
                "approval_key": g_approval_key,
                "custtype": CUST_TYPE,
                "tr_type": tr_type,
                "content-type": "utf-8"
            },
            "body": {
                "input": {
                    "tr_id": tr_id,
                    "tr_key": tr_key
                }
            }
        }
        await websocket.send(json.dumps(senddata))
        print('\n[전송]:', json.dumps(senddata, ensure_ascii=False))

        # AES KEY/IV 체결통보용(체결통보일 때만 저장됨)
        aes_key = aes_iv = None

        while True:
            data = await websocket.recv()
            if data[0] == '0':  # 실시간 데이터
                recvstr = data.split('|')
                trid0 = recvstr[1]
                if trid0 == "H0STASP0":  # 호가
                    stockhoka(recvstr[3])
                elif trid0 == "H0STCNT0":  # 체결
                    data_cnt = int(recvstr[2])
                    stockspurchase(data_cnt, recvstr[3])
            elif data[0] == '1':
                recvstr = data.split('|')
                trid0 = recvstr[1]
                if trid0 in ("H0STCNI0", "H0STCNI9"):  # 체결통보
                    if aes_key and aes_iv:
                        stocksigningnotice(recvstr[3], aes_key, aes_iv)
                    else:
                        print("아직 AES 키/IV를 수신하지 못했습니다.")
            else:  # 시스템 메시지, PING 등
                jsonObject = json.loads(data)
                trid = jsonObject["header"]["tr_id"]
                if trid not in ["PINGPONG"]:
                    rt_cd = jsonObject["body"]["rt_cd"]
                    print(f"\n[시스템] 코드: {rt_cd}, 메시지: {jsonObject['body']['msg1']}")
                    if rt_cd == '1':
                        break
                    elif rt_cd == '0' and 'output' in jsonObject["body"]:
                        # 체결통보일 때만 저장
                        aes_key = jsonObject["body"]["output"].get("key")
                        aes_iv = jsonObject["body"]["output"].get("iv")
                        if aes_key and aes_iv:
                            print(f"[AES] KEY={aes_key}, IV={aes_iv}")
                elif trid == "PINGPONG":
                    await websocket.pong(data)
                    print("[PINGPONG] 응답")

async def main():
    try:
        await connect()
    except KeyboardInterrupt:
        print("\n[종료] 사용자에 의해 종료되었습니다.")
    except Exception as e:
        print('Exception Raised!')
        print(e)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[종료] 프로그램이 정상적으로 종료되었습니다.")
        sys.exit(0)
    except Exception:
        print("Exception 발생!")
        print(traceback.format_exc())
        sys.exit(-200)