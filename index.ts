import { Application } from "express";
import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import Signin from "./network/Signin";
import Signup from "./network/Signup";
import PreSignup from "./network/PreSignup";
import { body, header, param, query } from "express-validator";
import Profile from "./network/Profile";
import RedeemGiftCode from "./payment/RedeemCode";
import SigninTwoFac from "./network/SigninTwoFac";
import SignupVerify from "./network/SignupVerify";

const app: Application = express();
const PORT = 3001;

//Import SQL
const { CheckUsername, CheckEmail, CheckGiftcode } = require('./network/SignupChecker');
const { TwoFactor, ForgotPass, ChangePass, UpdatePass } = require('./network/Settings');
//Import Mongodb
const { FindFavourByParam, SaveFavourite, GetFavourList } = require('./mongodb/database');
//Import Core
const { SearchAllByNameQuery, GetShowByNameParam, GetMovieByNameParam, GetShowcaseAll, GetTrendByOffset, GetMostWatchByOffset, GetRecentByOffset, GetExclusiveByOffset, GetShowByOffset, GetMovieByOffset, GetActionByOffset, GetCartoonByOffset, GetComedyByOffset, GetCrimeByOffset, GetDramaByOffset, GetFantasyByOffset, GetHorrorByOffset, GetLgbtqByOffset, GetRomanceByOffset, GetScifiByOffset, GetSuspenseByOffset, GetThrillerByOffset } = require('./core/Contents');

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
app.get(`/api/${process.env.API_V}/user/profile`, header('authorization').notEmpty(), Profile); //✅️
app.patch(`/api/${process.env.API_V}/user/redeem`, header('authorization').notEmpty(), body('giftcode').notEmpty(), RedeemGiftCode);//✅️
app.patch(`/api/${process.env.API_V}/user/settings/twofactor`, header('authorization').notEmpty(), body('is_twofactor').notEmpty(), TwoFactor);//✅️
app.post(`/api/${process.env.API_V}/forgot-password`, body('email').notEmpty(), ForgotPass);//✅️
app.post(`/api/${process.env.API_V}/user/settings/password`, header('authorization').notEmpty(), body('password').notEmpty(), ChangePass);//✅️
app.patch(`/api/${process.env.API_V}/user/settings/password`, query('token').notEmpty(), body('password').notEmpty(), UpdatePass);//✅️
//MONGODB Services
app.get(`/api/${process.env.API_V}/user/favourite`, header('authorization').notEmpty(), GetFavourList);//✅️
app.get(`/api/${process.env.API_V}/user/favourite/:title`, header('authorization').notEmpty(), param('title').notEmpty(), FindFavourByParam);//✅️
app.patch(`/api/${process.env.API_V}/user/favourite/:title`, header('authorization').notEmpty(), param('title').notEmpty(), body('is_favour').notEmpty(), SaveFavourite);//✅️

//CORE API
app.get(`/api/${process.env.API_V}/content/shows/:name`, header('authorization').notEmpty(), GetShowByNameParam);//✅️
app.get(`/api/${process.env.API_V}/content/movies/:name`, header('authorization').notEmpty(), GetMovieByNameParam);//✅️
app.get(`/api/${process.env.API_V}/content/search`, header('authorization').notEmpty(), query('name').notEmpty(), SearchAllByNameQuery);//✅️
app.get(`/api/${process.env.API_V}/content/showcase`, header('authorization').notEmpty(), GetShowcaseAll);//✅️
app.get(`/api/${process.env.API_V}/content/trending`, header('authorization').notEmpty(), GetTrendByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/most-watch`, header('authorization').notEmpty(), GetMostWatchByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/recent`, header('authorization').notEmpty(), GetRecentByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/exclusive`, header('authorization').notEmpty(), GetExclusiveByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/movies`, header('authorization').notEmpty(), GetMovieByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/shows`, header('authorization').notEmpty(), GetShowByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/showcase`, header('authorization').notEmpty(), GetShowcaseAll);//✅️
app.get(`/api/${process.env.API_V}/content/cate/action`, header('authorization').notEmpty(), GetActionByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/cate/cartoon`, header('authorization').notEmpty(), GetCartoonByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/cate/comedy`, header('authorization').notEmpty(), GetComedyByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/cate/crime`, header('authorization').notEmpty(), GetCrimeByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/cate/drama`, header('authorization').notEmpty(), GetDramaByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/cate/fantasy`, header('authorization').notEmpty(), GetFantasyByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/cate/horror`, header('authorization').notEmpty(), GetHorrorByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/cate/lgbtq`, header('authorization').notEmpty(), GetLgbtqByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/cate/romance`, header('authorization').notEmpty(), GetRomanceByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/cate/scifi`, header('authorization').notEmpty(), GetScifiByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/cate/suspense`, header('authorization').notEmpty(), GetSuspenseByOffset);//✅️
app.get(`/api/${process.env.API_V}/content/cate/thriller`, header('authorization').notEmpty(), GetThrillerByOffset);//✅️

app.listen(PORT, () => {
    console.log(`server is running..${PORT}`);
});

