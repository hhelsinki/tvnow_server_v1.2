import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { success_user_list } from "../lib/i18n";
import randtoken from 'rand-token';

const pools = require('../mysql/database');
const timekey = require('rand-token').generator({
    chars: '0-9'
});

function SigninTwoFac(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let email = req.query.email;
            let timekey_token = req.query.timekey_token;
            let id_token: number = req.body.id_token;

            pools.query('SELECT id, is_twofactor FROM user WHERE email = ?', [email], (err, result) => { //check if twofactor is enable
                if (err) throw err;
                let user_result = result[0];
                switch (user_result.is_twofactor) {
                    case 1: case true:
                        pools.query('SELECT * FROM authen WHERE (id_token = ? && timekey_token)', [id_token, timekey_token], (err, result) => { //check if timekey_token is valid
                            if (err) throw err;
                            let authen_result = result[0];
                            switch (result[0]) {
                                case null: case undefined: case '':
                                    return res.sendStatus(401);
                                default:
                                    let uid = user_result.id
                                    const timestamp = Date.now();
                                    let unix_timestamp = Math.floor(timestamp / 1000);
                                    let isTwoFactor =authen_result.is_twofactor;
                                    let isExpire =authen_result.timekey_expire;
                                    let mistakeCount =authen_result.mistake_count;
                                    let mistakeExpire =authen_result.mistake_expire;

                                    if (uid === authen_result.user_id) { //check if uid is match authen.user_id
                                        if (mistakeExpire === 0 || mistakeExpire === null) { //check if mistake expire is set e.g 15 mins, this means the user type the wrong id_token

                                        }
                                        //gen 6 digits
                                        //gen timekey_token(20)
                                        //gen timekey_expire date.now + 15 mins

                                        if (unix_timestamp > mistakeExpire) { //if the time is passed by 15 mins, reset and gen new token all
                                            pools.query('UPDATE authen SET id_token = ?, timekey_token = ?, timekey_expire = ?, mistake_count = 0, mistake_expire = 0 WHERE user_id = ?', [uid], (err, result) => {
                                                if (err) throw err;
                                                switch(result.changedRows) {
                                                    case 1:
                                                }
                                            })
                                        }




                                    }
                                    return res.sendStatus(401);
                            }
                        });
                        return;
                    default:
                        return res.sendStatus(405);
                }
            })



            pools.query('SELECT * FROM authen WHERE (email = ? && id_token = ?)', [email, id_token], (err, result) => {
                if (err) throw err;
                let results = result[0];
                switch (results) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        const timestamp = Date.now();
                        let unix_timestamp = Math.floor(timestamp / 1000);
                        let isTwoFactor = result[0].is_twofactor;
                        let isExpire = result[0].timekey_expire;
                        let mistakeCount = result[0].mistake_count;
                        let mistakeExpire = result[0].mistake_expire;


                }
            });
            return
        }
        return res.send({ status: false, message: result.array() });
    }

    if (api_key != '1234') {
        return res.sendStatus(402)
    }
}

export default SigninTwoFac;