import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { error_internal_list, error_user_list, success_user_list } from "../lib/i18n";
import ErrDetector from "../debug/ErrorDetector";
import crypto from 'crypto';
import randtoken from 'rand-token';

const pools = require('./database.js');

function Signup(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let email: string = req.body.email;
            let plan: string = req.body.plan;
            let username: string = req.body.username;
            //CHECK EXITS
            //@ts-ignore
            pools.query('SELECT username FROM user WHERE username = ?', [username], (err, result) => { //check whole exist username
                if (err) throw err;
                switch (result[0]) {
                    case null: case undefined: case '':
                        //@ts-ignore
                        pools.query('SELECT email FROM user WHERE email = ?', [email], (err, result) => {//check whole exist email
                            if (err) throw err;
                            switch (result[0]) {
                                case null: case undefined: case '':
                                    //@ts-ignore
                                    pools.query('SELECT * FROM giftcard WHERE email_used = ?', [email], (err, result) => {//check if giftcode is matched with email_used
                                        if (err) throw err;
                                        let giftcode_result = result[0];
                                        switch (giftcode_result) {
                                            case null: case undefined: case '':
                                                return res.send({ status: false, message: error_user_list.INVALID_GIFTCODE });
                                            default:
                                                if (giftcode_result.is_used === 0 || giftcode_result.is_used === false) {//check if giftcode can be used

                                                }
                                                return res.send({ status: false, message: error_user_list.DUPLICATE_GIFTCODE });
                                        }
                                    })
                                default:
                                    return res.send({ status: false, message: error_user_list.DUPLICATE_EMAIL });
                            }
                        })
                    default:
                        return res.send({ status: false, message: error_user_list.DUPLICATE_USERNAME });
                }
            });


            //UPSERT
            const password = crypto.randomBytes(10).toString('base64url');
            const access_token = randtoken.generate(20);
            //@ts-ignore
            pools.query('INSERT INTO user (username, password, email, access_token) VALUES (?, ?, ?, ?)', [username, password, email, access_token], (err, result) => { //insert to user
                if (err) throw err;
                switch (result.changedRows) { //id, code_id
                    case 1:
                        //@ts-ignore
                        pools.query(`SELECT user.id, giftcard.id as code_id FROM user INNER JOIN giftcard ON user.id = giftcard.id WHERE user.email = ?`, [email], (err, result) => { //get uid
                            if (err) throw err;
                            let results = result[0]; //result from inner join table
                            let uid = result[0].id;
                            let code_id = result[0].code_id;
                            switch (results) {
                                case null: case undefined: case '':
                                    return res.send({ status: false, message: error_internal_list.FAILED_SIGNUP });
                                default:
                                    //@ts-ignore
                                    pools.query('UPDATE giftcard SET is_used = 1 WHERE user_id = ?', [uid], (err, result) => { //update to giftcard
                                        if (err) throw err;
                                        switch (result.changedRows) {
                                            case 1:
                                                //@ts-ignore
                                                pools.query('INSERT INTO payment (user_id, plan, method, giftcard_id) VALUES (?, ?, ?, ?)', [uid, plan, 'giftcard', code_id], (err, result) => {
                                                    if (err) throw err;
                                                    switch (result.changedRows) {
                                                        case 1:
                                                            //@ts-ignore
                                                            pools.query('INSERT INTO authen (user_id) VALUES (?)', [uid], (err, result) => {
                                                                if (err) throw err;
                                                                switch (result.changedRows) {
                                                                    case 1:
                                                                        SendMailSignup(email, username, password, access_token);
                                                                        return res.send({ status: true, message: success_user_list.SUCCESS_MAIL_SIGNUP });
                                                                    default:
                                                                        ErrDetector('sql', 'authen', 24);
                                                                        return res.send({ status: false, message: error_internal_list.FAILED_SAVE_AUTHEN });
                                                                }
                                                            });
                                                        default:
                                                            ErrDetector('sql', 'payment', 17);
                                                            return res.send({ status: false, message: error_internal_list.FAILED_SAVE_PAYMENT });
                                                    }
                                                });
                                                break;
                                            default:
                                                return res.send({ status: false, message: error_internal_list.FAILED_SAVE_GIFTCODE });
                                        }
                                    });
                                    break;
                            }
                        });

                    default:
                        ErrDetector('sql', 'user', 63);
                        return res.sendStatus(500);
                }
            });



        }
        return res.send({ status: false, message: result.array() });

    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

export default Signup;