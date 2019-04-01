from flask_wtf import FlaskForm
from wtforms import PasswordField, StringField, SelectField, BooleanField
from wtforms.validators import DataRequired, EqualTo, Length


class RegisterForm(FlaskForm):
    firstname = StringField(
        'First Name', validators=[DataRequired(), Length(min=6, max=40)]
    )
    lastname = StringField(
        'Last Name', validators=[DataRequired(), Length(min=6, max=40)]
    )
    email = StringField(
        'Email', validators=[DataRequired(), Length(min=6, max=40)]
    )
    password = PasswordField(
        'Password', validators=[DataRequired(), Length(min=6, max=40)]
    )
    confirm = PasswordField(
        'Repeat Password',
        [DataRequired(),
        EqualTo('password', message='Passwords must match')]
    )


class LoginForm(FlaskForm):
    email = StringField('Email', [DataRequired()])
    password = PasswordField('Password', [DataRequired()])


class ForgotForm(FlaskForm):
    email = StringField(
        'Email', validators=[DataRequired(), Length(min=6, max=40)]
    )


class DetailsForm(FlaskForm):
    major = SelectField(
        'Major',
        [DataRequired()],
        choices=[('BS-BA', 'Business Administration (BBA)'),
                 ('BS-IT', 'Information Technology (BSIT)')],
    )
    advisor = SelectField(
        'Advisor',
        [DataRequired()],
        choices=[('sjanes@ltu.edu', 'Stefanie Janes'),
                 ('test@test.edu', 'Test Advisor')]
    )


class CourseForm(FlaskForm):
    test = BooleanField('test')
