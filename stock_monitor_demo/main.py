from flask import Flask, render_template, request, jsonify
from openpyxl import load_workbook
from pathlib import Path
from threading import Lock
from datetime import datetime

app = Flask(__name__)
EXCEL_FILE = Path(__file__).with_name("商品管理.xlsx")
lock = Lock()

# sensor_idごとの最新重量と通知状態をPC上に保持
latest_weights = {}
alerts = {}

def load_products():
    """Excelの1行目は見出し。必要な列名を読み込む。"""
    if not EXCEL_FILE.exists():
        raise FileNotFoundError(f"Excelファイルがありません: {EXCEL_FILE}")

    wb = load_workbook(EXCEL_FILE, data_only=True)
    ws = wb.active
    headers = [cell.value for cell in ws[1]]
    required = ["sensor_id", "商品名", "型番", "価格", "通知閾値_g"]
    missing = [h for h in required if h not in headers]
    if missing:
        raise ValueError("Excelに必要な列がありません: " + ", ".join(missing))

    products = []
    for row in ws.iter_rows(min_row=2, values_only=True):
        record = dict(zip(headers, row))
        if record.get("sensor_id") is None:
            continue
        sid = str(record["sensor_id"])
        products.append({
            "sensor_id": sid,
            "name": str(record.get("商品名") or ""),
            "model": str(record.get("型番") or ""),
            "price": record.get("価格") or 0,
            "threshold": float(record.get("通知閾値_g") or 0),
        })
    return products

@app.get("/")
def index():
    try:
        products = load_products()
        error = None
    except Exception as e:
        products, error = [], str(e)

    rows = []
    with lock:
        for p in products:
            sid = p["sensor_id"]
            weight = latest_weights.get(sid)
            rows.append({
                **p,
                "weight": weight,
                "alert": alerts.get(sid, False),
                "updated": datetime.now().strftime("%H:%M:%S") if weight is not None else "未受信",
            })
    return render_template("index.html", rows=rows, error=error)

@app.post("/api/weight")
def receive_weight():
    """ラズパイから {"sensor_id":"S01","weight_g":123.4} を受け取る。"""
    data = request.get_json(silent=True) or {}
    if "sensor_id" not in data or "weight_g" not in data:
        return jsonify(error="sensor_id と weight_g が必要です"), 400

    sid = str(data["sensor_id"])
    try:
        weight = float(data["weight_g"])
    except (TypeError, ValueError):
        return jsonify(error="weight_g は数値にしてください"), 400

    products = {p["sensor_id"]: p for p in load_products()}
    if sid not in products:
        return jsonify(error=f"Excelにsensor_id={sid}がありません"), 404

    threshold = products[sid]["threshold"]
    with lock:
        latest_weights[sid] = weight
        # 基準以下なら警告。補充されて基準を超えたら再び警告可能にする。
        if weight > threshold:
            alerts[sid] = False
        elif sid not in alerts:
            alerts[sid] = True
        # alerts[sid]がTrueの間は、画面から解除されるまで維持

    return jsonify(ok=True, sensor_id=sid, weight_g=weight)

@app.post("/api/reset/<sensor_id>")
def reset_alert(sensor_id):
    with lock:
        alerts[sensor_id] = False
    return jsonify(ok=True)

@app.get("/api/status")
def status():
    products = load_products()
    result = []
    with lock:
        for p in products:
            sid = p["sensor_id"]
            result.append({
                **p,
                "weight": latest_weights.get(sid),
                "alert": alerts.get(sid, False),
            })
    return jsonify(result)

if __name__ == "__main__":
    # host=0.0.0.0 にすると同じWi-Fi/LAN内の別PCからもアクセス可能
    app.run(host="0.0.0.0", port=5000, debug=False)
