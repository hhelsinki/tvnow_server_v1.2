import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { error_user_list } from "../lib/i18n";
import ErrDetector from "../debug/ErrorDetector";

const pool = require('./database.js');

function Signup(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let email:string = req.body.email;
            let plan:string = req.body.plan;
            let username:string = req.body.username;
            let giftcode:string = req.body.giftcode;
            //@ts-ignore
            pool.query('SELECT * FROM user WHERE email = ?', email, (err, result) => { //check if email is already used.
                if (err) throw err;
                let results = result[0];
                switch (result) {
                    case null: case undefined: case '':
                        if (results.username === username) { //check if username is already used
                            return res.send({ status: false, message: error_user_list.DUPLICATE_USERNAME });
                        }
                        //@ts-ignore
                        pool.query('SELECT * FROM giftcard WHERE user_id = ?', [results.id], (err, result) => { // check if giftcard is already used.
                            if (err) throw err;
                            let giftcard_result = result[0];
                            switch (giftcard_result.is_used) {
                                case 1:
                                    return res.send({ status: false, message: error_user_list.DUPLICATE_GIFTCODE });
                                default:
                                    //@ts-ignore
                                    pool.query('UPDATE giftcard SET is_used = 1 WHERE user_id = ?', [results.id], (err, result) => {
                                        if (err) throw err;
                                        switch (result.changedRows) {
                                            case 1:
                                                //@ts-ignore
                                                pool.query('INSERT INTO payment (user_id, plan, method, giftcard_id) VALUES (?, ?, ?, ?)', [results.id, plan, 'giftcard', giftcard_result.id], (err, result) => {
                                                    if (err) throw err;
                                                    switch (result.changedRows) {
                                                        case 1:
                                                            //@ts-ignore
                                                            pool.query('INSERT INTO authen (user_id) VALUES (?)', [results.id], (err, result) => {
                                                                if (err) throw err;
                                                                switch (result.changedRows) {
                                                                    case 1:
                                                                        const password = crypto.randomBytes(10).toString('base64url');
                                                                        const access_token = randtoken.generate(20);

                                                                        //@ts-ignore
                                                                        pool.query('INSERT INTO user (username, password, email, access_token) VALUES (?, ?, ?, ?)', [username, password, email, access_token], (err, result) => {
                                                                            if (err) throw err;
                                                                            switch (result.changedRows) {
                                                                                case 1:
                                                                                    //@ts-ignore
                                                                                    pool.query('SELECT email, username, password, access_token FROM user WHERE id = ?', [results.id], (err, result) => {
                                                                                        if (err) throw err;
                                                                                        SendMailSignup(email, username, result[0].password, result[0].access_token);
                                                                                        return;
                                                                                    });
                                                                                    break;
                                                                                default:
                                                                                    ErrDetector('sql', 'user', 63);
                                                                                    return res.sendStatus(500);
                                                                            }
                                                                        });
                                                                        break;
                                                                    default:
                                                                        ErrDetector('sql', 'authen', 55);
                                                                        return res.sendStatus(500);
                                                                }
                                                            });
                                                        default:
                                                            ErrDetector('sql', 'payment', 50);
                                                            return res.sendStatus(500);
                                                    }
                                                });
                                                break;
                                            default:
                                                ErrDetector('sql', 'giftcard', 45);
                                                return res.sendStatus(500);
                                        }
                                    });
                                    break;
                            }
                        })

                        break;
                    default:
                        return res.send({ status: false, message: error_user_list.DUPLICATE_EMAIL });
                }
            })

        }
        return res.send({ status: false, message: result.array() });

    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

export default Signup;