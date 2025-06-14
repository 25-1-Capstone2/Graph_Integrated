import FinanceDataReader as fdr

info_df = fdr.StockListing('KRX')
info_df.columns = [c.lower() for c in info_df.columns]

# 1. 코드 035720이 포함된 행 출력
print(info_df[info_df['code'] == '035720'])

# 2. 코드 리스트 일부 보기
print(info_df['code'].tolist()[:20])

# 3. 전체 columns
print(info_df.columns)
