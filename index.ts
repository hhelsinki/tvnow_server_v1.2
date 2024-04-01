import { Application } from "express";
import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import Signin from "./network/Signin";
import Signup from "./network/Signup";
import PreSignup from "./network/PreSignup";
import { body, query } from "express-validator";
import UserProfile from "./network/User";
import RedeemGiftCode from "./payment/RedeemCode";
import SigninTwoFac from "./network/SigninTwoFac";
import SignupVerify from "./network/SignupVerify";

const app: Application = express();
const PORT = 3001;
require('dotenv').config({ path: ".env" });

//Import SQL
// const {checkUsername, checkGiftcard} = require('./mysql/checker.js');
// const { getEmailGiftcard, getUserProfile, getForgotPassword } = require('./mysql/get.js');
// const { updateGiftcardEmail, updateUserPassword, updateTwoFactor, reqUserPassword, reqUserTwoFactor, reqUserRedeemGiftcard } = require('./mysql/update.js');
// const {upsertUser} = require('./mysql/upsert.js');
const { CheckUsername, CheckEmail, CheckGiftcode } = require('./network/SignupChecker');
const { TwoFactor, ForgotPass, ChangePass, UpdatePass } = require('./network/Settings');

const dir = path.join(__dirname, 'public');
app.use(express.static(dir));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


//NETWORK API
//SQL services
app.post(`/api/${process.env.API_V}/check-username`, body('username').notEmpty(), CheckUsername); //✅️
app.post(`/api/${process.env.API_V}/check-email`, body('email').notEmpty(), CheckEmail);//✅️
app.post(`/api/${process.env.API_V}/check-giftcode`, body('giftcode').notEmpty(), body('email').notEmpty(), CheckGiftcode);//✅️
app.post(`/api/${process.env.API_V}/signin`, body('username').notEmpty(), body('password').notEmpty(), Signin); //✅️
app.post(`/api/${process.env.API_V}/signin/twofactor`, body('username').notEmpty(), body('password').notEmpty(), SigninTwoFac);
app.get(`/api/${process.env.API_V}/signup`, query('email').notEmpty(), PreSignup); //✅️
app.post(`/api/${process.env.API_V}/signup`, body('email').notEmpty(), body('username').notEmpty(), body('plan').notEmpty(), Signup); //✅️
app.post(`/api/${process.env.API_V}/signup/verify`, query('token').notEmpty(), SignupVerify); //✅️
app.get(`/api/${process.env.API_V}/user/profile`, UserProfile); //✅️
app.patch(`/api/${process.env.API_V}/user/redeem`, body('giftcode').notEmpty(), RedeemGiftCode);//✅️
app.patch(`/api/${process.env.API_V}/user/settings/twofactor`, body('is_twofactor').notEmpty(), TwoFactor);//✅️
app.post(`/api/${process.env.API_V}/user/forgot-password`, body('email').notEmpty(), ForgotPass);
app.post(`/api/${process.env.API_V}/user/settings/password`, body('password').notEmpty(), ChangePass);
app.patch(`/api/${process.env.API_V}/user/settings/password`, query('token').notEmpty(), body('password').notEmpty(), UpdatePass);

app.listen(PORT, () => {
    console.log(`server is running..${PORT}`);
});

//res.status(200).json(contentShows_related[req.params.prim].req.params.sec)