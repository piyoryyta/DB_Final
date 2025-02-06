from supabase import Client, create_client
import os
from dotenv import load_dotenv


load_dotenv()


class DB:
    def __init__(self):
        self.client: Client = create_client(
            os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY")
        )

    def query(self):
        return _DBQuery(self)

    def get_items_in_history(self, historyset_id: int):
        return self.client.rpc(
            "get_items_in_history", {"historyset_id": historyset_id}
        ).execute().data
        # SELECT history.item_id, item_name, item_amount, item_total_amount, item_left_amount
        # FROM history
        # LEFT JOIN items ON history.item_id = items.item_id
        # WHERE history.historyset_id = $1;

    def get_histories_of_item(self, item_id: int):
        return self.client.rpc("get_histories_of_item", {"item_id": item_id}).execute().data
        # SELECT history.created_at, users.user_id, users.user_name, history.item_amount
        # FROM history
        # LEFT JOIN historyset
        # ON history.historyset_id = historyset.historyset_id
        # LEFT JOIN users
        # ON historyset.user_id = users.user_id
        # WHERE item_id = $1;


class _DBQuery:
    def __init__(self, db: DB):
        self._db = db
        self._mode = None
        self._table = None
        self._limit = None
        self._columns = None
        self._order = None
        self._where = []
        self._rows = []

    def table(self, table: str):
        self._table = table
        return self

    def select(self, columns: str):
        self._columns = columns
        self._mode = "select"
        return self

    def insert(self, rows: dict | list[dict]):
        if isinstance(rows, dict):
            rows = [rows]
        self._rows = rows
        self._mode = "insert"
        return self

    def update(self, row: dict):
        self._mode = "update"
        self.row = row
        return self

    def delete(self):
        self._mode = "delete"
        return self

    def limit(self, limit: int):
        self._limit = limit
        return self

    def where(self, column: str, condition: str, value):
        if condition == "=":
            self._where.append({"op": "eq", "column": column, "value": value})
        elif condition == "!=":
            self._where.append({"op": "neq", "column": column, "value": value})
        elif condition == ">":
            self._where.append({"op": "gt", "column": column, "value": value})
        elif condition == "<":
            self._where.append({"op": "lt", "column": column, "value": value})
        elif condition == ">=":
            self._where.append({"op": "gte", "column": column, "value": value})
        elif condition == "<=":
            self._where.append({"op": "lte", "column": column, "value": value})
        else:
            raise ValueError("Invalid condition")
        return self

    def _build_where(self, query):
        for w in self._where:
            if w["op"] == "eq":
                query = query.eq(w["column"], w["value"])
            elif w["op"] == "neq":
                query = query.neq(w["column"], w["value"])
            elif w["op"] == "gt":
                query = query.gt(w["column"], w["value"])
            elif w["op"] == "lt":
                query = query.lt(w["column"], w["value"])
            elif w["op"] == "gte":
                query = query.gte(w["column"], w["value"])
            elif w["op"] == "lte":
                query = query.lte(w["column"], w["value"])
            else:
                raise ValueError(f"Invalid condition: {w}")
        return query

    def order(self, column: str, order: str):
        if order == "asc":
            self._order = {"column": column, "order": "asc"}
        elif order == "desc":
            self._order = {"column": column, "order": "desc"}
        else:
            raise ValueError("Invalid order")
        return self

    def _build_order(self, query):
        if self._order:
            query = query.order(
                self._order["column"], desc=self._order["order"] == "desc"
            )
        return query

    def execute(self):
        query = self._db.client
        if self._mode == "select":
            query = query.table(self._table).select(self._columns)
            query = query.limit(self._limit) if self._limit else query
            query = self._build_where(query)
            query = self._build_order(query)
            res = query.execute()
            return res.data
        elif self._mode == "insert":
            query = query.table(self._table).insert(self._rows)
            res = query.execute()
            return res
        elif self._mode == "update":
            query = query.table(self._table).update(self.row)
            query = self._build_where(query)
            res = query.execute()
            return res
        elif self._mode == "delete":
            query = query.table(self._table).delete()
            query = self._build_where(query)
            res = query.execute()
            return res
        else:
            raise ValueError("Operation not specified")


if __name__ == "__main__":
    db = DB()
    print(db.query())
    print(db.query().table("items"))
    print(db.query().table("items").select("*").where("item_id", "=", 1))
    print(db.query().table("items").select("*").where("item_id", ">", 0).execute())
    print(db.query().table("items").select("*").execute())
