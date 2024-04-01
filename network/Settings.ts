import { Request, Response } from "express";
import { error_internal_list, error_user_list, success_user_list } from "../lib/i18n";
import { validationResult } from "express-validator";
import randtoken from 'rand-token';
import ErrDetector from "../debug/ErrorDetector";

const pools = require('../mysql/database.ts');

function TwoFactor(req: Request, res: Response) {
    let api_key = req.headers['api-key'];
    let authorization = req.headers['authorization'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let is_twofactor: boolean = req.body.is_twofactor;
            //@ts-ignore
            pools.query('SELECT id FROM user WHERE BINARY access_token = ?', [authorization], (err, result) => {
                if (err) throw err;
                switch (result[0]) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        //@ts-ignore
                        pools.query('UPDATE user SET is_twofactor = ? WHERE BINARY access_token = ?', [is_twofactor, authorization], (err, result) => {
                            if (err) throw err;
                            switch (result.changedRows) {
                                case 1:
                                    return res.send({ status: true, message: success_user_list.SUCCESS_SAVE_TWOFAC });
                                default:
                                    return res.send({ status: false, message: error_internal_list.FAILED_SAVE_TWOFAC });
                            }
                        });
                        return;
                }
            });
            return;
        }
        return res.send({ status: false, message: result.array() });
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

function ForgotPass(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let email: string = req.body.email;
            //@ts-ignore
            pools.query('SELECT username, email, password FROM user WHERE email = ?', [email], (err, result) => {
                if (err) throw err;
                let results = result[0];
                switch (results) {
                    case null: case undefined: case '':
                        return res.send({ status: false, message: error_user_list.NOTFOUND_EMAIL });
                    default:
                        let username: string = results.username;
                        let email: string = results.email;
                        let password: string = results.password;
                        SendMailForgotPass(username, email, password);
                        return res.send({ status: true, message: success_user_list.SUCCESS_MAIL_GET_PASS });
                }
            });
            return;
        }
        return res.send({ status: false, message: result.array() });
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

function ChangePass(req: Request, res: Response) {
    let api_key = req.headers['api-key'];
    let authorization = req.headers['authorization'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let password: string = req.body.password;
            //@ts-ignore
            pools.query('SELECT id, email FROM user WHERE BINARY access_token = ?', [authorization], (err, result) => {
                if (err) throw err;
                let results = result[0];
                switch (results) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        let password_real: string = results.password;
                        let uid: number = results.id;
                        let email: string = results.email;
                        if (password === password_real) {
                            const new_token = randtoken.generate(20);
                            //@ts-ignore
                            pools.query('UPDATE user SET access_token = ? WHERE id = ?', [new_token, uid], (err, result) => {
                                if (err) throw err;
                                switch (result.changedRows) {
                                    case 1:
                                        SendMailChangePass(email, new_token);
                                        return res.send({ status: true, message: success_user_list.SUCCESS_MAIL_CHANGE_PASS });
                                    default:
                                        ErrDetector('sql', 'update user', 102);
                                        return res.sendStatus(500);
                                }
                            });
                            return;
                        }
                        return res.send({ status: false, message: error_user_list.INVALID_PASSWORD });
                }
            });
            return;
        }
        return res.send({ status: false, message: result.array() });
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

function UpdatePass(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let token = req.query.token;
            let password: string = req.body.password;
            //@ts-ignore
            pools.query('SELECT id, password, is_verify FROM user WHERE BINARY access_token = ?', [token], (err, result) => {
                if (err) throw err;
                let results = result[0];
                switch (results) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        let uid: number = results.id;
                        let result_password: string = results.password;
                        let is_verify: boolean | number = results.is_verify;

                        if (is_verify === true || is_verify === 1) {
                            if (password === result_password) {
                                return res.send({ status: false, message: error_user_list.DUPLICATE_PASSWORD });
                            }
                            //@ts-ignore
                            pools.query('UPDATE user SET password = ? WHERE id = ?', [password, uid], (err, result) => {
                                if (err) throw err;
                                switch (result.changedRows) {
                                    case 1:
                                        return res.send({ status: true, message: success_user_list.SUCCESS_SAVE_PASSWORD });
                                    default:
                                        ErrDetector('sql', 'update user', 154);
                                        return res.sendStatus(500);
                                }
                            });
                            return;
                        }
                        return res.send({ status: false, message: error_user_list.MISSING_VERIFY });
                }
            });
            return;
        }
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

module.exports = { TwoFactor, ForgotPass, ChangePass, UpdatePass };