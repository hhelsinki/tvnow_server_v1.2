import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { error_user_list } from "../lib/i18n";
import randtoken from 'rand-token';

const pools = require('../mysql/database');

function SigninTwoFac(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let email = req.query.email;
            let timekey_token = req.query.timekey_token;
            let id_token: number = req.body.id_token;

            //@ts-ignore
            pools.query('SELECT * FROM authen WHERE (email = ? && BINARY timekey_token = ?)', [email, timekey_token], (err, result) => {
                if (err) throw err;

                switch (result[0]) {
                    case null: case undefined:
                        res.send({ status: false, message: error_user_list.INVALID_TOKEN });
                        break;
                    default:
                        const timestamp = Date.now();
                        let unix_timestamp = Math.floor(timestamp / 1000);
                        let isTwoFactor = result[0].is_twofactor;
                        let isExpire = result[0].timekey_expire;
                        let mistakeCount = result[0].mistake_count;
                        let mistakeExpire = result[0].mistake_expire;

                        if (mistakeExpire === 0 || mistakeExpire === null) {
                            //normal logic
                            if (isTwoFactor === 0) {
                                res.sendStatus(405);
                                return;
                            }
                            //if ((unix_timestamp >= isExpire) && (unix_timestamp < (isExpire + 900))) {
                            if (unix_timestamp <= isExpire) {
                                //@ts-ignore
                                pools.query('SELECT * FROM authen WHERE (email =? && id_token = ?)', [email, id_token], (err, result) => {
                                    if (err) throw err;

                                    //do process
                                    if (mistakeCount === 3) {
                                        //update db mistake_expire
                                        //@ts-ignore
                                        pools.query('UPDATE authen SET mistake_expire = ? WHERE email =?', [unix_timestamp + 3600, email], (err, result) => {
                                            if (err) throw err;

                                            switch (result.changedRows) {
                                                case 1:
                                                    res.send({ status: 'false', message: error_user_list.INVALID_SIGNIN_TIME, time: unix_timestamp + 3600 });
                                                    break;
                                                case 0:
                                                    res.sendStatus(500);
                                                    break;
                                            }
                                        });
                                        return;
                                    }
                                    switch (result[0]) {
                                        case null: case undefined:
                                            //@ts-ignore
                                            pools.query('UPDATE authen SET mistake_count = ? WHERE email = ?', [mistakeCount + 1, email], (err, result) => {
                                                if (err) throw err;
                                                res.send({ status: false, message: error_user_list.INVALID_DIGITCODE });
                                            });
                                            break;
                                        default:
                                            //@ts-ignore
                                            pools.query('UPDATE authen SET mistake_count = 0 WHERE email = ?', email, (err, result) => {
                                                if (err) throw err;

                                                switch (result.changedRows) {
                                                    case 1:
                                                        const access_token = randtoken.generate(20);
                                                        //@ts-ignore
                                                        pools.query('UPDATE user SET access_token = ? WHERE email = ?', [access_token, email], (err, result) => {
                                                            if (err) throw err;
                                                            switch (result.changedRows) {
                                                                case 1:
                                                                    res.send({ status: true, data: access_token });
                                                                    break;
                                                                case 0: default:
                                                                    res.sendStatus(500);
                                                                    break;
                                                            }
                                                        });
                                                        break;
                                                    case 0:
                                                        res.sendStatus(500);
                                                        break;
                                                }
                                            });

                                            break;
                                    }
                                });
                                return;
                            }
                            //if (unix_timestamp > (isExpire + 900)) { //5 mins = 300, 15 mins = 900
                            if (unix_timestamp > isExpire) {
                                //console.log('run out of time');
                                res.send({ status: false, message: error_user_list.EXPIRED_TOKEN });
                                return;
                            }
                            else {
                                console.log('something wrong')
                                res.sendStatus(401);
                                return;
                            }
                        }
                        if (mistakeExpire !== 0) {
                            if (unix_timestamp > mistakeExpire) {
                                //@ts-ignore
                                pools.query('UPDATE authen SET mistake_count = 0, mistake_expire = 0 WHERE email = ?', email, (err, result) => {
                                    if (err) throw err;

                                    switch (result.changedRows) {
                                        case 1:
                                            if (isTwoFactor === 0) {
                                                res.sendStatus(405);
                                                return;
                                            }
                                            //if ((unix_timestamp >= isExpire) && (unix_timestamp < (isExpire + 900))) {
                                            if (unix_timestamp <= isExpire) {
                                                //@ts-ignore
                                                pools.query('SELECT * FROM authen WHERE (email =? && id_token = ?)', [email, id_token], (err, result) => {
                                                    if (err) throw err;
                                                    //do process
                                                    switch (result[0]) {
                                                        case null: case undefined:
                                                            let newMistakeCount = 0;
                                                            //@ts-ignore
                                                            pools.query('UPDATE authen SET mistake_count = ? WHERE email = ?', [newMistakeCount + 1, email], (err, result) => {
                                                                if (err) throw err;
                                                                res.send({ status: false, message: error_user_list.INVALID_TOKEN });
                                                            });
                                                            break;
                                                        default:
                                                            const access_token = randtoken.generate(20);
                                                            //@ts-ignore
                                                            pools.query('UPDATE user SET access_token = ? WHERE email = ?', [access_token, email], (err, result) => {
                                                                if (err) throw err;
                                                                switch (result.changedRows) {
                                                                    case 1:
                                                                        res.send({ status: true, data: access_token });
                                                                        break;
                                                                    case 0: default:
                                                                        res.sendStatus(500);
                                                                        break;
                                                                }
                                                            });
                                                            break;
                                                    }
                                                });
                                                return;
                                            }
                                            //if (unix_timestamp > (isExpire + 900)) { //5 mins = 300, 15 mins = 900
                                            if (unix_timestamp > isExpire) {
                                                console.log('run out of time');
                                                res.send({ status: false, message: error_user_list.EXPIRED_TOKEN });
                                                return;
                                            }
                                            else {
                                                res.sendStatus(401);
                                            }
                                            break;
                                        case 0:
                                            res.sendStatus(500);
                                            break;
                                    }
                                });
                                return;
                            }
                            if (unix_timestamp < mistakeExpire) {
                                res.send({ status: false, message: 'Please wait after 1 hour.' });
                                return;
                            }
                        }
                }
            });
            return;
        }
        return res.send({ status: false, message: result.array() });
    }

    if (api_key != '1234') {
        return res.sendStatus(402)
    }
}

export default SigninTwoFac;