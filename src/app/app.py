from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from dbwrap import DB

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
