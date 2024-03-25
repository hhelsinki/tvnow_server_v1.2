const nodemailer = require('nodemailer');
require('dotenv').config({ path: "../.env" });

const mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDMAIL_USER,
        pass: process.env.SENDMAIL_PASS
    }
});

function SendMailSignup({ email, username, password, token }: MailSignupProps) {
    var mailOptions = {
        from: 'TVnow',
        to: email,
        subject: 'TVnow.com | Register Verification',
        html: `<h2>Your Payment is successful, kindly use this <a href="http://localhost:3000/register-verify?user=${username}&token=${token}">link</a> to activate this account. (Only for the 1st time)</h2>
        <h3>Your Account</h3>
            <h4>Username:</b> ${username}</h4>
            <h4>Password:</b> ${password}</h4>
            <p><i>Please do not share the password with anyone.</i></p>`
    }
    //@ts-ignore
    mail.sendMail(mailOptions, (err, info) => {
        if (err) throw err;
    });
}

function SendMailTwoFactor({ email, id_token, timekey_token }: MailTwoFacProps) {
    var mailOptions = {
        from: 'TVnow',
        to: email,
        subject: 'TVnow.com | 2 Step Verification Login',
        html: `<h2>Please enter these numbers to login, or go to this <a href="http://localhost:3000/login-twofac_email?user=${email}&token=${timekey_token}">link within 15 minutes.</a></h2>
            <h1>Code: ${id_token}</h1>`
    }
    //@ts-ignore
    mail.sendMail(mailOptions, (err, info) => {
        if (err) throw err;
    });
}

function SendMailChangePass({ email, token }: MailChangePassProps) {
    var mailOptions = {
        from: 'TVnow',
        to: email,
        subject: 'TVnow.com | Change Password',
        html: `<h2>You request to change the current password, kindly use this <a href="http://localhost:3000/password-submit?user=${email}&token=${token}">link</a> to change password.</h2>
        <h3>
            <i>If you're not submit this, we highly recommended you to change your current password.</i>
        </h3>`
    }
    //@ts-ignore
    mail.sendMail(mailOptions, (err, info) => {
        if (err) throw err;
    });
}

function SendMailForgotPass({ email, username, password }: MailForgotPassProps) {
    var mailOptions = {
        from: 'TVnow',
        to: email,
        subject: 'TVnow.com | Forgot Password',
        html: `<h2>You request the forgotten password, please feel free to login <a href="http://localhost:3000/login">here</a>.</h2>
        <h3>Your Account</h3>
            <h4>Username:</b> ${username}</h4>
            <h4>Password:</b> ${password}</h4>
            <p><i>Please do not share the password with anyone.</i></p>`
    }
    //@ts-ignore
    mail.sendMail(mailOptions, (err, info) => {
        if (err) throw err;
    });
}

module.exports = { SendMailSignup, SendMailTwoFactor, SendMailChangePass, SendMailForgotPass };