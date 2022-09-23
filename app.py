from flask import Flask, request, jsonify, send_file
from psycopg2 import connect, extras
from cryptography.fernet import Fernet

app = Flask(__name__)
key = Fernet.generate_key()

host = 'localhost'
port = 5432
dbname = 'usersdb'
user = 'postgres'
password = 'toor12345'


def get_connection():
    conn = connect(host=host, port=port, dbname=dbname,
                   user=user, password=password)
    return conn


# @app.get('/')
# def home():
    # conn = get_connection()  # obtener conneccion
    # cur = conn.cursor()  # hacer consulta

    # cur.execute("SELECT 1 + 1")
    # result = cur.fetchone()
    # print(result)
    # return 'Hello World'


@app.get('/api/users')
def get_users():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('SELECT * FROM users')
    users = cur.fetchall()

    conn.close()
    cur.close()
    return jsonify(users)


@app.post('/api/users')
def create_user():
    # print(request.get_json())
    new_user = request.get_json()
    username = new_user['username']
    email = new_user['email']
    password = Fernet(key).encrypt(bytes(new_user['password'], 'utf-8'))

    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('INSERT INTO users (username, email, password) VALUES (%s, %s, %s) RETURNING *',
                (username, email, password))
    new_created_user = cur.fetchone()
    print(new_created_user)
    conn.commit()
    cur.close()
    conn.close()
    print(username, email, password)
    return jsonify(new_created_user)


@app.delete('/api/users/<id>')
def delete_user(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('DELETE FROM users WHERE id = %s RETURNING *', (id,))
    user = cur.fetchone()  # Retorna el usuario
    print(user)

    conn.commit()
    cur.close()
    conn.close()

    if user is None:
        return jsonify({'Message': 'User not found'}), 404
    return jsonify(user)


@app.put('/api/users/<id>')
def update_user(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)

    new_user = request.get_json()
    username = new_user['username']
    email = new_user['email']
    password = Fernet(key).encrypt(bytes(new_user['password'], 'utf-8'))

    cur.execute('UPDATE users SET username = %s, email = %s, password = %s WHERE id = %s RETURNING *',
                (username, email, password, id))
    updated_user = cur.fetchone()

    conn.commit()  # Ejecuta la consulta con el commit
    cur.close()
    conn.close()

    if updated_user is None:
        return jsonify({'message': 'User not found'}), 404

    return jsonify(updated_user)


@app.get('/api/users/<id>')
def get_user(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('SELECT * FROM users WHERE id = %s', (id,))
    user_id = cur.fetchone()
    if user_id is None:
        return jsonify({'Message': 'User not found'}), 404
    return jsonify(user_id)


@app.get('/')
def home():
    return send_file('static/index.html')


if __name__ == '__main__':
    app.run(debug=True)
