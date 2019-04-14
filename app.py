import logging
import json
import requests
import base64
from logging.handlers import RotatingFileHandler
from flask import Flask, request, abort, render_template, session, jsonify, redirect, url_for
# from flask_cors import CORS
from functools import wraps
from forms import *
from site_libs import helpers
from flask_socketio import SocketIO

logPath = 'logs/frontend.log'
_logger = logging.getLogger("progress_tracker")
_logger.setLevel(logging.DEBUG)
handler = RotatingFileHandler(logPath, maxBytes=20971520, backupCount=10)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
_logger.addHandler(handler)

api_base_url = 'http://127.0.0.1:5000/progress-tracker/v1/'

app = Flask(__name__)
socketio = SocketIO(app)

with open('config.json') as f:
    configs = json.load(f)
api_user = configs.get('user')
api_pwd = configs.get('password')
creds = "{}:{}".format(api_user, api_pwd)
basic_auth = base64.b64encode(creds.encode('utf-8')).decode('utf-8')


# logged in user wrapper
def authorize(data):
    @wraps(data)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return data(*args, **kwargs)
        else:
            return redirect(url_for('login'))
            #form = LoginForm(request.form)
            #return render_template('forms/login.html', form=form)

    return wrap


@app.route('/')
def index():
    session.clear()
    return render_template('pages/home.html')


@app.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        endpoint = api_base_url + 'signInGate'
        email = request.form.get('email')
        psw = request.form.get('password')
        data = {
            'user_email': email,
            'password': psw
        }
        result = _post_api_request(data, endpoint)

        if result.get('code') >= 400:
            return render_template('pages/error.html', result=result)

        if result.get('code') <= 201:
            session['logged_in'] = True
            session['user_email'] = email
            endpoint = api_base_url + 'getUserRole'

            result = _post_api_request({'user_email': email}, endpoint)
            role = result.get('user_role')

            if role == 'Student':
                return redirect(url_for('flowchart'))
            else:
                form = AdminForm(request.form)
                endpoint = api_base_url + 'getAllStudents/' + session['user_email']
                resp = requests.post(endpoint,
                                     headers={"Authorization": "Basic {}".format(basic_auth)})
                data = json.loads(resp.text)

                student_list = []
                for student in data:
                    student_id = student[0]
                    email = student[1]

                    student_list.append((student_id, email))

                form.students.choices = student_list

                return render_template('forms/admin_form.html', form=form)
    else:
        form = LoginForm(request.form)
        return render_template('forms/login.html', form=form)


@app.route('/register', methods=['POST', 'GET'])
def register():
    if request.method == 'GET':
        form = RegisterForm(request.form)
        return render_template('forms/register.html', form=form)
    else:
        first = request.form.get('firstname')
        last = request.form.get('lastname')
        email = request.form.get('email')
        psw = request.form.get('password')

        data = {
            'user_email': email,
            'password': psw,
            'firstname': first,
            'lastname': last
        }

        endpoint = api_base_url + 'signUpGate'
        result = _post_api_request(data, endpoint)

        if result.get('code') >= 400:
            return render_template('pages/error.html', result=result)

        if result.get('code') <= 201:
            session['logged_in'] = True
            session['user_email'] = email
            endpoint = api_base_url + 'getUserRole'

            result = _post_api_request({'user_email': email}, endpoint)
            role = result.get('user_role')
            if role == 'Student':
                form = DetailsForm(request.form)
                return render_template('forms/details_form.html', form=form)
            else:
                form = AdminForm(request.form)
                endpoint = api_base_url + 'getAllStudents/' + session['user_email']
                resp = requests.post(endpoint,
                                     headers={"Authorization": "Basic {}".format(basic_auth)})
                data = json.loads(resp.text)

                student_list = []
                for student in data.get('data'):
                    student_id = student.get('id')
                    email = student.get('email')

                    student_list.append((student_id, email))

                form.students.choices = student_list

                return render_template('forms/admin_form', result=data)


@app.route('/check_email/<path:email>', methods=['POST'])
def check_email(email):
    endpoint = api_base_url + 'check_email_exists/' + email
    resp = requests.post(endpoint,
                         headers={"Authorization": "Basic {}".format(basic_auth)})
    result = json.loads(resp.text)
    exists = result.get('exists')

    return jsonify({'exists': exists})


@app.route('/main', methods=['POST'])
def main():
    print(main)


@app.route('/course_form', methods=['POST'])
@authorize
def course_form():
    major = request.form.get('major')
    advisor = request.form.get('advisor')
    user_email = session.get('user_email')
    data = {
        "user_email": user_email,
        "major": major,
        "advisor": advisor
    }

    endpoint = api_base_url + 'getProgramCourses'
    result = _post_api_request(data, endpoint)
    result = helpers.update_course_results(result)

    return render_template('forms/completed_courses.html', result=result)


@app.route('/testing', methods=['POST', 'GET'])
def testing():
    return render_template('forms/flowchart.html')


@app.route('/test', methods=['POST', 'GET'])
def test():
    data = {
        "user_email": 'rmedoro@ltu.edu',
        "major": 'BS-IT'
    }

    endpoint = api_base_url + 'getProgramCourses'
    result = _post_api_request(data, endpoint)
    result = helpers.update_course_results(result)

    return render_template('forms/completed_courses.html', result=result)


@app.route('/update_progress', methods=['POST'])
@authorize
def update_progress():
    data = request.form
    user_email = session.get('user_email')
    request_obj = helpers.process_request(data)
    if request_obj:
        endpoint = api_base_url + 'initialCourseIntake/' + user_email

        result = _post_api_request(request_obj, endpoint)
        if result.get('code') >= 400:
            return render_template('pages/error.html', result=result)
        else:
            return redirect(url_for('flowchart'))


@app.route('/flowchart', methods=['POST', 'GET'])
@authorize
def flowchart():
    user = session.get('user_email')
    if request.method == 'GET':
        endpoint = api_base_url + 'getFlowchartData/' + user
        resp = requests.post(endpoint,
                             headers={"Authorization": "Basic {}".format(basic_auth)})
        result = json.loads(resp.text)
        result = helpers.update_course_results(result)
        result = helpers.process_flowchart_result(result)
    else:
        endpoint = api_base_url + 'updateFlowchartData'
        data = {}
        result = _post_api_request(data, endpoint)

        if result.get('code') >= 400:
            return render_template('pages/error.html', result=result)
        result = helpers.update_course_results(result)
        result = helpers.process_flowchart_result(result)
    return render_template('pages/flowchart.html', result=result)


@app.route('/get_student_progress', methods=['POST'])
@authorize
def admin_student_progress():
    data = request.get_json()
    student_id = data.get('student_id')
    advisor = session['user_email']
    endpoint = api_base_url + 'adminGetStudentProgress'
    post_data = {'student_id': student_id, 'advisor': advisor}

    result = _post_api_request(post_data, endpoint)
    if result.get('code') >= 400:
        return render_template('pages/error.html', result=result)
    else:
        data = result.get('return_obj')

        return jsonify(data)


@app.route('/forgot')
def forgot():
    return render_template('forms/forgot')


@app.route('/logout', methods=['GET'])
@authorize
def logout():
    session.clear()
    return render_template('forms/login')


def _post_api_request(data, endpoint):
    resp = requests.post(
        endpoint, json=data,
        headers={
            'Content-Type': 'application/json',
            "Authorization": "Basic {}".format(basic_auth)
        }
    )

    return json.loads(resp.text)


@socketio.on('disconnect')
def disconnect_user():
    #logout_user()
    session.clear()


if __name__ == '__main__':
    # _logger.info('Server is Listening.....')
    # TODO: temporary for testing. This will be removed from the py file
    # and placed in a secret key config file prior to launch.
    app.secret_key = 'f3cfe9ed8fae309f02079dbf'
    app.run(debug=True, port=80)

