import { Application } from "express";
import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import Signin from "./network/Signin";
import Signup from "./network/Signup";

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
app.post(`/api/${process.env.API_V}/signin`, Signin);
app.post(`/api/${process.env.API_V}/signup`, Signup);
app.post(`/api/${process.env.API_V}/check-username`, CheckUsername);
app.post(`/api/${process.env.API_V}/check-email`, CheckEmail);
app.post(`/api/${process.env.API_V}/check-giftcode`, CheckGiftcode);

app.listen(PORT, () => {
    console.log(`server is running..${PORT}`);
})

//res.status(200).json(contentShows_related[req.params.prim].req.params.sec)