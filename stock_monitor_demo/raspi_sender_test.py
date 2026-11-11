"""ラズパイ側の送信テスト用。センサーの代わりに仮の重量を送信します。"""
import time
import requests

PC_IP = "192.168.1.10"  # 管理用PCのIPアドレスに変更
SENSOR_ID = "S01"
URL = f"http://{PC_IP}:5000/api/weight"

# 例として、10秒ごとに重量を少しずつ減らして送信
weight = 500.0
while True:
    try:
        response = requests.post(
            URL,
            json={"sensor_id": SENSOR_ID, "weight_g": weight},
            timeout=3
        )
        print(response.status_code, response.text)
        weight -= 20
        if weight < 0:
            weight = 500.0
    except requests.RequestException as e:
        print("送信エラー:", e)
    time.sleep(10)
