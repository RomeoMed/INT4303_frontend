import logging
import json
from logging.handlers import RotatingFileHandler
from flask import Flask, request, abort, render_template
#from flask_cors import CORS
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
    form = LoginForm(request.form)
    return render_template('forms/login.html', form=form)


@app.route('/main')
def main():
    email = request.form.get('name')
    psw = request.form.get('password')
    #TODO: add api call to the progress_tracker_api
    # if successful
    # assign results to session variables for current session
    # session['logged_id'] = True
    # session['access_token'] = api_response['access_token']
    # session['user_email'] = email
    # and whatever else we may need to reference more than once.
    return render_template('pages/content.html')


@app.route('/forgot')
def forgot():
    return render_template('forms/forgot')


if __name__ == '__main__':
    # _logger.info('Server is Listening.....')
    #TODO: temporary for testing. This will be removed from the py file
    # and placed in a secret key config file prior to launch.
    app.secret_key = 'f3cfe9ed8fae309f02079dbf'
    app.run(debug=True)