import logging
import json
import requests
import base64
from logging.handlers import RotatingFileHandler
from flask import Flask, request, abort, render_template, session, jsonify
# from flask_cors import CORS
from functools import wraps
from forms import *

logPath = 'logs/frontend.log'
_logger = logging.getLogger("progress_tracker")
_logger.setLevel(logging.DEBUG)
handler = RotatingFileHandler(logPath, maxBytes=20971520, backupCount=10)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
_logger.addHandler(handler)

api_base_url = 'http://127.0.0.1:5000/progress-tracker/v1/'

app = Flask(__name__)


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


@app.route('/register')
def register():
    session['newUser'] = True
    form = RegisterForm(request.form)
    return render_template('forms/register.html', form=form)


@app.route('/main', methods=['POST'])
def main():
    new_user = session['newUser']
    email = request.form.get('name')
    psw = request.form.get('password')

    session['user_email'] = email
    data = {
        'user_email': email,
        'password': psw
    }

    if new_user:
        url = 'signUpGate'
    else:
        url = 'signInGate'
    endpoint = api_base_url + url
    resp = requests.post(
        endpoint, json=data,
        headers={
            'Content-Type': 'application/json',
        }
    )
    result = json.loads(resp.text)

    if result.get('code') >= 400:
        return render_template('pages/error.html', result=result)

    if result.get('code') <= 201:
        session['access_token'] = result.get('access_token')

        endpoint = api_base_url + 'getUserRole'
        resp = requests.post(
            endpoint, data=jsonify({'user_email': email}),
            headers={
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + session['access_token']
            }
        )

        result = json.loads(resp.txt)
        if result.get('role') == 'Student':
            if url == 'signUpGate':
                form = DetailsForm(request.form)
                return render_template('forms/details_form.html', form=form)
            #TODO: get_user_details
            # if details = first_login
            # render details form
            #else:
                #render content html.
    return render_template('pages/content.html')


@app.route('/test', methods=['POST', 'GET'])
def test():
    form = DetailsForm(request.form)
    return render_template('forms/details_form.html', form=form)

@app.route('/forgot')
def forgot():
    return render_template('forms/forgot')




if __name__ == '__main__':
    # _logger.info('Server is Listening.....')
    # TODO: temporary for testing. This will be removed from the py file
    # and placed in a secret key config file prior to launch.
    app.secret_key = 'f3cfe9ed8fae309f02079dbf'
    app.run(debug=True, port=80)
