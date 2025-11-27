import pandas as pd

df = pd.read_csv("dam_data.csv")
print(df.head())
print(df.columns)
for col in df.columns:
    print("=====")
    print(col)
    uniq = df[col].unique()
    if len(uniq) > 100:
        print(f"size: {len(uniq)}")
    else:
        print(uniq)

