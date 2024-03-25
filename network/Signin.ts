import {Request, Response } from "express";
import { validationResult } from "express-validator";
import { error_user_list, success_user_list } from "../lib/i18n";
import ErrDetector from "../debug/ErrorDetector";

const pool = require('../mysql/database');

function Signin(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let username:string = req.body.username;
            let password:string = req.body.password;
            //@ts-ignore
            pool.query('SELECT * FROM user WHERE ((username = ? || email = ?) && password = ?)', [username, username, password], (err, result) => {
                if (err) throw err;
                let results = result[0];
                switch (results) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        switch (results.is_verify) {
                            case 1:
                                switch (results.is_twofactor) {
                                    case 1:
                                        //@ts-ignore
                                        pool.query('SELECT * FROM authen WHERE user_id = ?', [results.id], (err, result) => {
                                            if (err) throw err;
                                            let authenResult = result[0];
                                            const timestamp = Date.now();
                                            let unix_timestamp = Math.floor(timestamp / 1000);

                                            if (authenResult.mistake_expire != 0) {
                                                return res.send({ status: false, message: `${error_user_list.INVALID_SIGNIN_TIME} ${(unix_timestamp + 3600)}` });
                                            }

                                            const timekey_id = timekey.generate(6);
                                            const timekey_token = randtoken.generate(20);
                                            //@ts-ignore
                                            pool.query('UPDATE authen SET id_token = ?, timekey_token = ?, timekey_expire = UNIX_TIMESTAMP()+4500 WHERE user_id = ?', [timekey_id, timekey_token, results.id], (err, result) => {
                                                if (err) throw err;
                                                switch (result.changedRows) {
                                                    case 1:
                                                        SendEmailTwoFactor(results.email, timekey_id, timekey_token);
                                                        return res.send({
                                                            status: true,
                                                            data: { username: results.email, token: timekey_token },
                                                            message: success_user_list.SUCCESS_TOKEN_EMAIL
                                                        });
                                                    default:
                                                        // console.log(`${error_internal_list.FAILED_UPSERT_SQL} authen`);
                                                        // console.log(`${error_internal_list.FAILED_LINE} 51`);
                                                        ErrDetector('authen', 51)
                                                        return res.sendStatus(500);
                                                }
                                            })

                                        })

                                    default:
                                        const token = randtoken.generate(20);
                                        //@ts-ignore
                                        pool.query('UPDATE user SET access_token = ? WHERE id = ?', [token, results.id], (err, result) => {
                                            if (err) throw err;
                                            switch (result.changedRows) {
                                                case 1:
                                                    //upsert to mongo
                                                    let upsertNoSql = async () => {
                                                        await client.connect();
                                                        const findUser = await collection.find({ user: results.email }).toArray();
                                                        switch (findUser[0]) {
                                                            case null: case undefined: case '':
                                                                const insertUser = await collection.insertOne({ user: results.email, token: token, data: [] });
                                                                break;
                                                            default:
                                                                const updateResult = await collection.updateOne({ user: results.email }, { $set: { token: token } });
                                                                break;
                                                        }
                                                    }
                                                    upsertNoSql();
                                                    return res.send({ status: true, data: token });
                                                default:
                                                    ErrDetector('user', 74);
                                                    return res.sendStatus(500);
                                            }

                                        })
                                }
                                return;
                            default:
                                return res.send({ status: false, message: error_user_list.INVALID_VERIFY });
                        }
                }
            })
            return;
        }
        return res.sendStatus(401);
    }

    if (api_key != '1234') {
        return res.sendStatus(402)
    }
}

export default Signin;