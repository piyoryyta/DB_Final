from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from dbwrap import DB
import json

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
load_dotenv()

db = DB()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/use-return")
def use_return():
    return render_template("use_return.html")


@app.route("/use-return/complete/<int:historyset_id>")
def use_return_complete(historyset_id):
    history = db.function("get_items_in_history", {"historyset_id": historyset_id}).data
    #               SELECT history.item_id, item_name, item_amount, item_total_amount, item_left_amount
    #               FROM history
    #               LEFT JOIN items ON history.item_id = items.item_id
    #               WHERE history.historyset_id = $1;

    is_use = False
    is_return = False
    if history:
        for item in history:
            if item["item_amount"] > 0:
                is_use = True
            elif item["item_amount"] < 0:
                is_return = True
    print(history)
    return render_template(
        "use_return_complete.html",
        histories=history,
        is_use=is_use,
        is_return=is_return,
    )


@app.route("/items")
def items():
    return render_template("items.html", items=items)


@app.route("/api/use-return", methods=["POST"])
def use_return_api():
    if request.method == "POST":
        data = request.form["data"]
        data = json.loads(data)
        user_id = request.form["user_id"]
        db.query().table("historyset").insert({"user_id": user_id}).execute()
        historyset_id = (
            db.query()
            .table("historyset")
            .select("historyset_id")
            .order("historyset_id", "desc")
            .limit(1)
            .execute()[0]["historyset_id"]
        )
        for item in data:
            db.query().table("history").insert(
                {
                    "item_id": item["item_id"],
                    "item_amount": item["item_amount"],
                    "historyset_id": historyset_id,
                }
            ).execute()
            db.query().table("items").update(
                {"item_left_amount": item["item_left_amount"]}
            ).where("item_id", "=", item["item_id"]).execute()
        return jsonify({"success": True, "historyset_id": historyset_id})
    return jsonify({"error": "Invalid request"})


@app.route("/api/historyset/<int:historyset_id>")
def get_historyset(historyset_id):
    res = {"error": "Invalid request"}
    user_id_res = (
        db.query()
        .table("historyset")
        .select("*")
        .where("historyset_id", "=", historyset_id)
        .execute()
    )
    if len(user_id_res) > 0:
        user_id = user_id_res[0]["user_id"]
        created_at = user_id_res[0]["created_at"]
        history = (
            db.query()
            .table("history")
            .select("history_id, item_id, item_amount")
            .where("historyset_id", "=", historyset_id)
            .execute()
        )
        res = {
            "historyset_id": historyset_id,
            "created_at": created_at,
            "user_id": user_id,
            "history": history,
        }
    return jsonify(res)


@app.route("/api/item", methods=["GET"])
def get_items():
    if request.method == "GET":
        id = request.args.get("id")
        id = int(id) if id else None
        if id:
            res = (
                db.query()
                .table("items")
                .select("*")
                .where("item_id", "=", id)
                .execute()
            )
            return jsonify(res)
    return jsonify({"error": "Invalid request"})


if __name__ == "__main__":
    app.run(debug=True)
