import { Request, Response } from "express";
import { error_internal_list, error_user_list, success_user_list } from "../lib/i18n";
import ErrDetector from "../debug/ErrorDetector";
import { validationResult } from "express-validator";

const pools = require('../mysql/database.ts');

function CheckUsername(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let username: string = req.body.username;
            //@ts-ignore
            pools.query(`SELECT id FROM user WHERE username = ?`, [username], (err, result) => {
                if (err) throw err;
                switch (result[0]) {
                    case null: case undefined: case '':
                        return res.send({ status: true, message: success_user_list.VALID_USERNAME });
                    default:
                        return res.send({ status: false, message: error_user_list.DUPLICATE_USERNAME });
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

function CheckEmail(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let email: string = req.body.email;
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            let validateEmail = emailRegex.test(email);
            if (validateEmail === true) {
                //@ts-ignore
                pools.query(`SELECT id FROM user WHERE email = ?`, [email], (err, result) => {
                    if (err) throw err;
                    switch (result[0]) {
                        case null: case undefined: case '':
                            return res.send({ status: true, message: success_user_list.VALID_EMAIL });
                        default:
                            return res.send({ status: false, message: error_user_list.DUPLICATE_EMAIL });
                    }
                });
                return;
            } else {
                return res.send({ status: false, message: error_user_list.INVALID_EMAIL });
            }

        }
        return res.send({ status: false, message: result.array() });
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

function CheckGiftcode(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let giftcode: string = req.body.giftcode;
            let email: string = req.body.email;
            //@ts-ignore
            pools.query('SELECT id, is_used FROM giftcard WHERE BINARY code = ?', [giftcode], (err, result) => {
                if (err) throw err;
                switch (result[0]) {
                    case null: case undefined: case '':
                        return res.send({ status: false, message: error_user_list.INVALID_GIFTCODE });
                    default:
                        switch (result[0].is_used) {
                            case 0:
                                //@ts-ignore
                                pools.query('UPDATE giftcard SET email_used = ? WHERE id = ?', [email, result[0].id], (err, result) => {
                                    if (err) throw err;
                                    switch (result.changedRows) {
                                        case 1:
                                            return res.send({ status: true, message: success_user_list.VALID_GIFTCODE });
                                        default:
                                            ErrDetector('sql', 'giftcard', 67);
                                            return res.send({ status: false, message: error_internal_list.FAILED_SAVE_GIFTCODE });
                                    }
                                });
                                return;

                            default:
                                return res.send({ status: false, message: error_user_list.DUPLICATE_GIFTCODE });
                        }
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

module.exports = { CheckUsername, CheckEmail, CheckGiftcode };