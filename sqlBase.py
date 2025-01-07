import psycopg2

db_config = {
    "dbname": "postgres",
    "user": "postgres",
    "password": "password",
    "host": "localhost",
    "port": "5432",
}


def connect():
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        return conn, cursor
    except Exception as e:
        print(e)
        return None, None


def main():
    conn, cursor = connect()
    if conn is not None and cursor is not None:
        print("Connection successful")
        cursor.execute("SELECT * FROM table_name")
        raw = cursor.fetchall()
        # cursor.fetchone() # get one row
        # cursor.fetchmany(5) # get 5 rows
        for r in raw:
            print(f"{r[0]} {r[1]}")
        cursor.close()
        conn.close()
    else:
        print("Connection failed")
