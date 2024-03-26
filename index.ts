import { Application } from "express";
import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import Signin from "./network/Signin";
import Signup from "./network/Signup";
import VerifySignup from "./network/SignupVerify";
import PreSignup from "./network/PreSignup";
import { body } from "express-validator";
import UserProfile from "./network/User";
import ActivateTwoFac from "./network/TwoFacEnable";
import RedeemGiftCode from "./payment/RedeemCode";

const app: Application = express();
const PORT = 3001;
require('dotenv').config({ path: ".env" });

//Import SQL
// const {checkUsername, checkGiftcard} = require('./mysql/checker.js');
// const { getEmailGiftcard, getUserProfile, getForgotPassword } = require('./mysql/get.js');
// const { updateGiftcardEmail, updateUserPassword, updateTwoFactor, reqUserPassword, reqUserTwoFactor, reqUserRedeemGiftcard } = require('./mysql/update.js');
// const {upsertUser} = require('./mysql/upsert.js');
const { CheckUsername, CheckEmail, CheckGiftcode } = require('./network/SignupChecker');

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
// app.post(`/api/${process.env.API_V}/signin`, Signin);
app.get(`/api/${process.env.API_V}/signup`, body('email').notEmpty(), PreSignup); //✅️
// app.post(`/api/${process.env.API_V}/signup`, Signup);
// app.post(`/api/${process.env.API_V}/verify-signup`, VerifySignup);
app.get(`/api/${process.env.API_V}/user/profile`, UserProfile); //✅️
app.patch(`/api/${process.env.API_V}/user/redeem`, body('giftcode').notEmpty(), RedeemGiftCode);//✅️
app.patch(`/api/${process.env.API_V}/user/settings/twofactor`, body('is_twofactor').notEmpty(), ActivateTwoFac);//✅️

app.listen(PORT, () => {
    console.log(`server is running..${PORT}`);
})

//res.status(200).json(contentShows_related[req.params.prim].req.params.sec)