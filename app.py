import re
import mysql.connector
import bcrypt
import configparser
import io
from flask import Flask, request
import mysql.connector
from collections import defaultdict
import random
import string
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

"""
resources:
https://www.w3schools.com/
https://reactjs.org/docs/getting-started.html
https://developer.mozilla.org/en-US/
https://stackoverflow.com/
application inspired by:
https://slack.com/
login inspired by:
https://bootsnipp.com/tags/login





"""




config = configparser.ConfigParser()
config.read('secrets.cfg')
DB_NAME = 'matthewpozsgaibelay'
DB_USERNAME = config['secrets']['DB_USERNAME']
DB_PASSWORD = config['secrets']['DB_PASSWORD']





app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

cnx = mysql.connector.connect(user=DB_USERNAME, password=DB_PASSWORD, host='127.0.0.1', database=DB_NAME,
                              pool_name="c_pool", pool_size=10)
salt = bcrypt.gensalt()

SENDGRID_API_KEY='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'


@app.route('/channel/<param>')
@app.route('/')
def hello_world(param=None):
    return app.send_static_file('index.html')

@app.route('/api/verify', methods=['GET'])
def verify():
    if request.method == 'GET':
        channel = request.headers.get('channel')
        print(channel)
        token = request.headers.get('token')
        query = "SELECT * from users WHERE token = %s"
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")
            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(query, (token,))
            result = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Token'}

        query = "SELECT * from channels WHERE channel_name = %s"
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")
            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(query, (channel,))
            result2 = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Channel'}

        if len(result2) == 0:
            return {"status": "failed", "error": 'Invalid Channel'}

        return {"status":"ok", "user": result[0]}



@app.route('/api/change', methods=['POST'])
def change():
    if request.method == 'POST':
        new_email = request.headers.get('new_email')
        new_username = request.headers.get('new_username')
        token = request.headers.get('token')
        user_info = request.headers.get("user_info").split(",")
        query = "SELECT * from users WHERE user_id = %s"
        params = user_info[0]
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")
            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(query, (params,))
            result = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Login'}
        if token != result[0][4]:
            return {"status": "failed", "error": 'Invalid Session Token'}

        if (new_email == "") and (new_username == ""):
            print("HERE")
            return {"status": "no update", "user_info": user_info}

        if (new_email == "") and (new_username != ""):
            query = "Update users set username = %s where user_id = %s"
            params = (new_username, user_info[0])
            try:
                db3 = mysql.connector.connect(pool_name="c_pool")
                cursor3 = db3.cursor(prepared=True)
                cursor3.execute(query, params)
                db3.commit()
                cursor3.close()
                db3.close()
            except Exception as e:
                print(e)
                return {"status": "failed", "error": 'Invalid Login'}

        if (new_email != "") and (new_username == ""):
            query = "Update users set email = %s where user_id = %s"
            params = (new_email, user_info[0])
            try:
                db3 = mysql.connector.connect(pool_name="c_pool")
                cursor3 = db3.cursor(prepared=True)
                cursor3.execute(query, params)
                db3.commit()
                cursor3.close()
                db3.close()
            except Exception as e:
                print(e)
                return {"status": "failed", "error": 'Invalid Login'}
        if (new_email != "") and (new_username != ""):
            query = "Update users set email = %s,username = %s where user_id = %s"
            params = (new_email, new_username, user_info[0])
            try:
                db3 = mysql.connector.connect(pool_name="c_pool")
                cursor3 = db3.cursor(prepared=True)
                cursor3.execute(query, params)
                db3.commit()
                cursor3.close()
                db3.close()
            except Exception as e:
                print(e)
                return {"status": "failed", "error": 'Email is taken'}

        query = "SELECT * from users WHERE user_id = %s"
        params = user_info[0]
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")
            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(query, (params,))
            result = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Login'}

        return {"status": "ok", "user_info":result[0]}



@app.route('/api/updatepassword', methods=['POST'])
def changep():
    if request.method == 'POST':
        new_password = request.headers.get('new_p')
        hashed = bcrypt.hashpw(new_password.encode('utf-8'), salt)
        user_info = request.headers.get("user_info").split(",")
        query = "UPDATE users set password = %s where user_id = %s"
        params = (hashed, user_info[0])
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")
            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(query, params)
            db3.commit()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Login'}

        query = "SELECT * from users WHERE user_id = %s"
        try:
            db2 = mysql.connector.connect(pool_name="c_pool")
            cursor2 = db2.cursor(prepared=True)
            cursor2.execute(query, (user_info[0],))
            result = cursor2.fetchall()
            cursor2.close()
            db2.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": "SQL error"}

        if len(result) == 0:
            return {"status": "failed", "error": "Invalid password"}
        print(result[0])
        return {"status": "ok", "user": result[0]}




        return {"status": "ok", "user_info":result[0]}


@app.route('/api/passwordreset', methods =['POST'])
def passwordreset():
    if request.method == 'POST':
        token = randomString()
        link = request.headers.get("link").split("magic=")[1]

        update_query = "Update users set token = %s WHERE link = %s"
        params = (token, link)
        try:
            db4 = mysql.connector.connect(pool_name="c_pool")
            cursor4 = db4.cursor(prepared=True)
            cursor4.execute(update_query, params)
            db4.commit()
            cursor4.close()
            db4.close()
        except Exception as e:
            print("HERE")
            print(e)
            return {"status": "failed", "error": 'Invalid link'}

        query = "SELECT * from users WHERE link = %s"
        try:
            db2 = mysql.connector.connect(pool_name="c_pool")
            cursor2 = db2.cursor(prepared=True)
            cursor2.execute(query, (link,))
            result = cursor2.fetchall()
            cursor2.close()
            db2.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": "SQL error"}
        print(result)
        if len(result) == 0:
            return {"status": "failed", "error": "Invalid Link"}
        return {"status": "ok", "user": result[0], "session_token": token}



@app.route('/api/forgotpassword', methods =['POST'])
def reset():
    if request.method == 'POST':
        email = request.headers.get("email")

        query = "SELECT * from users WHERE email = %s"
        try:
            db2 = mysql.connector.connect(pool_name="c_pool")
            cursor2 = db2.cursor(prepared=True)
            cursor2.execute(query, (email,))
            result = cursor2.fetchall()
            cursor2.close()
            db2.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": "SQL error"}

        if len(result) == 0:
            return {"status": "failed", "error": "Invalid Email"}

        magic_link = randomString()
        message = Mail(
            from_email='reset@Belay.com',
            to_emails=email,
            subject='Belay Password Reset',
            html_content='<strong> http://127.0.0.1:5000/?magic='+magic_link+'</strong>')
        try:
            sendgrid_client = SendGridAPIClient('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')
            response = sendgrid_client.send(message)
            print(response.status_code)
            print(response.body)
            print(response.headers)
        except Exception as e:
            print(e)

        query = "Update users set link = %s where email = %s"
        params = (magic_link, email)
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")
            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(query, params)
            db3.commit()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Eamil'}

        return {"status": "ok"}

# endpoint to create a new user - takes email and password and returns status, user info
@app.route('/api/signup', methods=['POST'])
def signup():
    if request.method == 'POST':
        password = request.headers.get('password')
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        email = request.headers.get('email')
        username = request.headers.get('username')
        token = randomString()
        try:
            db1 = mysql.connector.connect(pool_name="c_pool")
            sql = "INSERT INTO users (username, email, password, token) VALUES (%s, %s, %s, %s)"
            params = (username, email, hashed, token)
            cursor1 = db1.cursor(prepared=True)
            cursor1.execute(sql, params)
            db1.commit()
            cursor1.close()
            db1.close()
        except Exception as e:
            print(e)

            return {"status": "failed", "error": "Email Taken", "session_token":None}

        query = "SELECT * from users WHERE email = %s"
        try:
            db2 = mysql.connector.connect(pool_name="c_pool")
            cursor2 = db2.cursor(prepared=True)
            cursor2.execute(query, (email,))
            result = cursor2.fetchall()
            cursor2.close()
            db2.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": "SQL error", "session_token":None}

        sql = "insert into unread(user_id, channel) select %s, channel_name from channels"
        user_id = result[0][0]
        try:
            db2 = mysql.connector.connect(pool_name="c_pool")
            cursor2 = db2.cursor(prepared=True)
            cursor2.execute(sql, (user_id,))
            db2.commit()
            cursor2.close()
            db2.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": "SQL error", "session_token":None}

        return {'status': "ok", "user_info": result[0], "session_token":token}


@app.route('/api/signin', methods=['POST'])
def signin():
    if request.method == 'POST':
        email = request.headers.get('email')
        password = request.headers.get('password')
        token = randomString()
        query = "SELECT * from users WHERE email = %s"
        params = email
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")
            cursor3 = db3.cursor()
            cursor3.execute(query, (params,))
            result = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Login'}

        if len(result) == 0:
            return  {"status": "failed", "error": 'Invalid email'}


        update_query = "Update users set token = %s WHERE email = %s"
        params = (token, email)
        try:
            db4 = mysql.connector.connect(pool_name="c_pool")
            cursor4 = db4.cursor(prepared=True)
            cursor4.execute(update_query, params)
            db4.commit()
            cursor4.close()
            db4.close()
        except Exception as e:
            print("HERE")
            print(e)
            return {"status": "failed", "error": 'Invalid Login'}
        success = bcrypt.checkpw(password.encode('utf-8'), result[0][3].encode('utf-8'))
        if success:
            return {"status": "ok", "user_info": (result[0]), "token": token}
        else:
            return {"status": "failed", "error": "invalid password", "token":None}


@app.route('/api/new_messages', methods=['POST'])
def new_messages():
    if request.method == 'POST':
        channel = request.headers.get("channel")
        user_info = request.headers.get("user").split(",")
        token = request.headers.get("token")
        query = "SELECT * from users WHERE email = %s"
        params = user_info[2]
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")

            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(query, (params,))
            result = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Login'}
        if token != result[0][4]:
            return {"status": "failed", "error": 'Invalid Session Token'}

        user_id = user_info[0]
        sql = "update unread set num_unread = 0 where user_id = %s and channel = %s"
        params = (user_id, channel)
        try:
            db4 = mysql.connector.connect(pool_name="c_pool")
            cursor4 = db4.cursor(prepared=True)
            cursor4.execute(sql, params)
            db4.commit()
            cursor4.close()
            db4.close()
        except Exception as e:

            return {"status": "failed", "error1": 'Invalid'}

        try:
            db4 = mysql.connector.connect(pool_name="c_pool")
            query = "select * from messages JOIN users on author_id=user_id WHERE channel = %s ORDER BY message_id"
            cursor4 = db4.cursor(prepared=True)
            cursor4.execute(query, (channel,))
            result = cursor4.fetchall()
            cursor4.close()
            db4.close()
        except Exception as e:
            print(e)

            return {"status": "failed", "error": 'Invalid Login'}

        if len(result) == 0:
            return {"status": "ok", "messages": {}, "replies": {}}

        message_dict = dict()
        replies = defaultdict(list)
        for row in result:
            if row[1] not in message_dict:
                if row[2] is None:

                    message_dict[row[1]] = [{
                        "message_num": row[0],
                        "message_body": row[3],
                        "author_id": row[6],
                        "author_name": row[7],
                        "author_email": row[8],
                        "posted": row[5],
                        "image": []
                    }]
                else:
                    replies[row[2]] = [{

                        "message_num": row[0],
                        "message_body": row[3],
                        "author_id": row[6],
                        "author_name": row[7],
                        "author_email": row[8],
                        "posted": row[5],
                        "image": []
                    }]
            else:
                if row[2] is None:
                    message_dict[row[1]].append({
                        "message_num": row[0],
                        "message_body": row[3],
                        "author_id": row[6],
                        "author_name": row[7],
                        "author_email": row[8],
                        "posted": row[5],
                        "image": []
                    })

                else:
                    if row[2] not in replies:
                        replies[row[2]] = [{
                            "message_num": row[0],
                            "message_body": row[3],
                            "author_id": row[6],
                            "author_name": row[7],
                            "author_email": row[8],
                            "posted": row[5],
                            "image": []
                        }]
                    else:
                        replies[row[2]].append({
                            "message_num": row[0],
                            "message_body": row[3],
                            "author_id": row[6],
                            "author_name": row[7],
                            "author_email": row[8],
                            "posted": row[5],
                            "image": []
                        }
                        )

        for message in message_dict[row[1]]:

            for word in message["message_body"].split():
                if len(isImage(word)) > 0:
                    message["message_body"] = message["message_body"].replace(word, " ")
                    # message["image"].append("<img src = \"" + word + "\"> </img>")
                    message["image"].append(word)

        for i in replies:
            for message in replies[i]:
                for word in message["message_body"].split():
                    if len(isImage(word)) > 0:
                        message["message_body"] = message["message_body"].replace(word, " ")
                        # message["image"].append("<img src = \"" + word + "\"> </img>")
                        message["image"].append(word)


        return {"status": "ok", "messages": message_dict[row[1]], "replies": replies}



def isImage(text):
    return re.findall("(?i)\.(jpg|png|gif|jpeg)$", text)


@app.route('/api/messages', methods=['POST', 'GET'])
def messages():
    if request.method == 'GET':
        user_info = request.headers.get("user").split(",")
        channel = request.headers.get("channel")
        unread = request.headers.get("unread")
        message_id = request.headers.get("message_id")
        token = request.headers.get("token")
        num_unread = int(unread)
        sql = "SELECT * from users WHERE email = %s"
        email = user_info[2]
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")
            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(sql, (email,))
            result = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Login'}
        if token != result[0][4]:
            return {"status": "failed", "error": 'Invalid Session Token'}

        try:
            db4 = mysql.connector.connect(pool_name="c_pool")
            query = "select * from messages JOIN users on author_id=user_id WHERE channel = %s ORDER BY message_id"
            cursor4 = db4.cursor(prepared=True)
            cursor4.execute(query, (channel,))
            result = cursor4.fetchall()
            cursor4.close()
            db4.close()
        except Exception as e:
            print(e)
             
            return {"status": "failed", "error": 'Invalid Login'}

        if len(result) == 0:
            return{"status": "ok", "messages": {}, "replies": {} }

        message_dict = dict()
        replies = defaultdict(list)
        for row in result:
            if row[1] not in message_dict:
                if row[2] is None:

                    message_dict[row[1]] = [{
                        "message_num": row[0],
                        "message_body": row[3],
                        "author_id": row[6],
                        "author_name": row[7],
                        "author_email": row[8],
                        "posted": row[5],
                        "image":[]
                    }]
                else:
                    replies[row[2]] = [{

                        "message_num": row[0],
                        "message_body": row[3],
                        "author_id": row[6],
                        "author_name": row[7],
                        "author_email": row[8],
                        "posted": row[5],
                        "image": []
                    }]
            else:
                if row[2] is None:
                    message_dict[row[1]].append({
                        "message_num": row[0],
                        "message_body": row[3],
                        "author_id": row[6],
                        "author_name": row[7],
                        "author_email": row[8],
                        "posted": row[5],
                        "image": []
                    })

                else:
                    if row[2] not in replies:
                        replies[row[2]] = [{
                            "message_num": row[0],
                            "message_body": row[3],
                            "author_id": row[6],
                            "author_name": row[7],
                            "author_email": row[8],
                            "posted": row[5],
                            "image": []
                        }]
                    else:
                        replies[row[2]].append({
                            "message_num": row[0],
                            "message_body": row[3],
                            "author_id": row[6],
                            "author_name": row[7],
                            "author_email": row[8],
                            "posted": row[5],
                            "image": []
                        }
                        )

        for message in message_dict[row[1]]:

            for word in message["message_body"].split():
                if len(isImage(word))>0:
                    message["message_body"] = message["message_body"].replace(word," ")
                    #message["image"].append("<img src = \"" + word + "\"> </img>")
                    message["image"].append(word)

        for i in replies:
            for message in replies[i]:
                for word in message["message_body"].split():
                    if len(isImage(word)) > 0:
                        message["message_body"] = message["message_body"].replace(word, " ")
                        #message["image"].append("<img src = \"" + word + "\"> </img>")
                        message["image"].append(word)



        if num_unread > 0:

            return {"status": "ok", "messages": message_dict[row[1]][:-num_unread], "replies": replies}

        else:
            return {"status": "ok", "messages": message_dict[row[1]], "replies": replies}


    if request.method == 'POST':
        user_info = request.headers.get("user").split(",")
        user_id = user_info[0]
        message = request.headers.get("message")
        channel = request.headers.get("channel")
        message_id = request.headers.get("message_id")
        inThread = request.headers.get("inThread")
        token = request.headers.get("token")

        sql = "SELECT * from users WHERE email = %s"
        email = user_info[2]
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")

            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(sql, (email,))
            result = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Login'}
        if token != result[0][4]:
            return {"status": "failed", "error": 'Invalid Session Token'}


        query = "INSERT INTO messages (channel, replies_to, body, author_id) VALUES (%s, %s, %s, %s)"
        if (inThread == "false"):
            params = (channel, None, message, user_id)
        else:
            params = (channel, message_id, message, user_id)
        try:
            db5 = mysql.connector.connect(pool_name="c_pool")
            cursor5 = db5.cursor(prepared=True)
            cursor5.execute(query, params)
            db5.commit()
            cursor5.close()
            db5.close()
        except Exception as e:

            print(e)
            return {"status": "failed", "error1": 'Invalid Login'}

        if (inThread != "false"):
            return {"status": "ok"}

        sql = "update unread set num_unread = num_unread + 1 where user_id != %s AND channel = %s"

        try:
            db5 = mysql.connector.connect(pool_name="c_pool")
            cursor5 = db5.cursor(prepared=True)
            cursor5.execute(sql, (user_id, channel))
            db5.commit()
            cursor5.close()
            db5.close()
        except Exception as e:

            return {"status": "failed", "error1": 'Invalid'}
        return {"status": "ok"}



@app.route('/api/channels', methods=['POST', 'GET'])
def channels():
    if request.method == 'GET':
        sql = "SELECT * from users WHERE email = %s"
        user_info = request.headers.get("user").split(",")
        email = user_info[2]
        token = request.headers.get("token")
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")

            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(sql, (email,))
            result = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Login'}
        if token != result[0][4]:
            return {"status": "failed", "error": 'Invalid Session Token'}


        user_id = request.headers.get("user").split(",")[0]
        query = "select channel_name, created_by_id, username,  created_on, num_unread from users " \
                "JOIN channels on user_id = created_by_id " \
                "JOIN  unread on channel_name = channel where unread.user_id = %s"

        try:
            db6 = mysql.connector.connect(pool_name="c_pool")
            cursor6 = db6.cursor(prepared=True)
            cursor6.execute(query, (user_id, ))
            result = cursor6.fetchall()
            cursor6.close()
            db6.close()
        except Exception as e:
            print(e)
            "HERE"
             
            return {"status": "failed", "error": 'Server Error'}

        chats = dict()
        for i in result:
            chats[i[0]] = {
                "creator_id": i[1],
                "creator_name": i[2],
                "created": i[3],
                "num_unread":i[4]
            }
        return {"status": "ok", "channels": chats}

    if request.method == "POST":
        sql = "SELECT * from users WHERE email = %s"
        user_info = request.headers.get("user").split(",")
        email = user_info[2]
        token = request.headers.get("token")
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")

            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(sql, (email,))
            result = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Login'}
        if token != result[0][4]:
            return {"status": "failed", "error": 'Invalid Session Token'}

        channel_name = request.headers.get("channel")
        print(channel_name)
        query = "SELECT * from channels WHERE channel_name = %s"
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")
            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(query, (channel_name,))
            result2 = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Channel'}

        if len(result2) != 0:
            return {"status": "failed", "error": 'Channel Already Exists'}

        invalid = "".join(string.punctuation.split("_"))
        for i in invalid:
            print(i)
            if i in channel_name:
                print("retuning invalid")
                return {"status": "failed", "error": 'Invalid Channel Name'}
        if len(channel_name.split(" ")) > 1:
            print("space")
            return {"status": "failed", "error": 'Invalid Channel Name'}


        user_info = request.headers.get("user").split(",")
        user_id = user_info[0]
        sql = "insert into channels(channel_name, created_by_id) values (%s, %s)"
        params = (channel_name, user_id)
        db7 = mysql.connector.connect(pool_name="c_pool")
        try:
            cursor7 = db7.cursor(prepared=True)
            cursor7.execute(sql, params)
            db7.commit()
            cursor7.close()
            db7.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error1": 'Invalid Login'}

        sql2 = "insert into unread(user_id, channel) select user_id, %s from users"

        try:
            db2 = mysql.connector.connect(pool_name="c_pool")
            cursor2 = db2.cursor(prepared=True)
            cursor2.execute(sql2, (channel_name,))
            db2.commit()
            cursor2.close()
            db2.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": "SQL error"}
        return {"status": "ok"}


@app.route('/api/delete', methods=['POST'])
def delete():
    if request.method == "POST":
        sql = "SELECT * from users WHERE user_id = %s"
        user_info = request.headers.get("user_info").split(",")
        id = user_info[0]
        token = request.headers.get("token")
        try:
            db3 = mysql.connector.connect(pool_name="c_pool")
            cursor3 = db3.cursor(prepared=True)
            cursor3.execute(sql, (id,))
            result = cursor3.fetchall()
            cursor3.close()
            db3.close()
        except Exception as e:
            print(e)
            return {"status": "failed", "error": 'Invalid Login'}
        if token != result[0][4]:
            return {"status": "failed", "error": 'Invalid Session Token'}

        channel_name = request.headers.get("channel")
        sql = "delete from channels where channel_name = %s"
        db7 = mysql.connector.connect(pool_name="c_pool")
        try:
            cursor7 = db7.cursor(prepared=True)
            cursor7.execute(sql, (channel_name, ))
            db7.commit()
            cursor7.close()
            db7.close()
        except Exception as e:
            print(e)
            print("here")
            return {"status": "failed", "error1": 'Invalid Login'}

        return {"status": "ok"}


def randomString():
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(20))

if __name__ == '__main__':
    app.run()
