import logging
import json
import requests
import base64
import base64
from logging.handlers import RotatingFileHandler
from flask import Flask, request, abort, render_template, session, jsonify
# from flask_cors import CORS
from functools import wraps
from forms import *
from site_libs import helpers

logPath = 'logs/frontend.log'
_logger = logging.getLogger("progress_tracker")
_logger.setLevel(logging.DEBUG)
handler = RotatingFileHandler(logPath, maxBytes=20971520, backupCount=10)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
_logger.addHandler(handler)

api_base_url = 'http://127.0.0.1:5000/progress-tracker/v1/'

app = Flask(__name__)

with open('config.json') as f:
    configs = json.load(f)
api_user = configs.get('user')
api_pwd = configs.get('password')
creds = "{}:{}".format(api_user, api_pwd)
basic_auth = base64.b64encode(creds.encode('utf-8')).decode('utf-8')


# logged in user wrapper
def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            form = LoginForm(request.form)
            return render_template('forms/login.html', form=form)

    return wrap


@app.route('/')
def index():
    return render_template('pages/home.html')


@app.route('/login')
def login():
    session['newUser'] = False
    form = LoginForm(request.form)
    return render_template('forms/login.html', form=form)


@app.route('/register', methods=['POST', 'GET'])
def register():
    session['newUser'] = True
    form = RegisterForm(request.form)

    return render_template('forms/register.html', form=form)


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
    new_user = session['newUser']
    email = request.form.get('email')
    psw = request.form.get('password')
    first = request.form.get('firstname')
    last = request.form.get('lastname')

    session['user_email'] = email
    data = {
        'user_email': email,
        'password': psw,
        'firstname': first,
        'lastname': last
    }

    if new_user:
        url = 'signUpGate'
    else:
        url = 'signInGate'
    endpoint = api_base_url + url
    result = _post_api_request(data, endpoint)

    if result.get('code') >= 400:
        return render_template('pages/error.html', result=result)

    if result.get('code') <= 201:
        endpoint = api_base_url + 'getUserRole'

        result = _post_api_request(json.dumps({'user_email': email}, endpoint))
        role = result.get('user_role')
        if role == 'Student':
            if url == 'signUpGate':
                form = DetailsForm(request.form)
                return render_template('forms/details_form.html', form=form)
            #TODO: get_user_details
            # if details = first_login
            # render details form
            #else:
                #render content html.
    return render_template('pages/content.html')


@app.route('/course_form', methods=['POST'])
@login_required
def course_form():
    major = request.form.get('major')
    user_email = session.get('user_email')
    data = {
        "user_email": user_email,
        "major": major
    }

    endpoint = api_base_url + '/getProgramCourses'
    result = _post_api_request(data, endpoint)


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
def update_progress():
    data = request.form

    request_obj = helpers.process_request(data)
    if request_obj:
        endpoint = api_base_url + 'initialCourseIntake/' + 'rmedoro@ltu.edu'

        result = _post_api_request(request_obj, endpoint)
        return render_template('<html><p>Success: ' + str(result.get('success')) + '</p></br><p>Code: ' + str(result.get('code')) + '</p></br>' + '<p>Message: ' + result.get('message') + '</p></html?')



@app.route('/forgot')
def forgot():
    return render_template('forms/forgot')


def _post_api_request(data, endpoint):
    resp = requests.post(
        endpoint, json=data,
        headers={
            'Content-Type': 'application/json',
            "Authorization": "Basic {}".format(basic_auth)
        }
    )

    return json.loads(resp.text)


if __name__ == '__main__':
    # _logger.info('Server is Listening.....')
    # TODO: temporary for testing. This will be removed from the py file
    # and placed in a secret key config file prior to launch.
    app.secret_key = 'f3cfe9ed8fae309f02079dbf'
    app.run(debug=True, port=80)
