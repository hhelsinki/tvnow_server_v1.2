import { Request, Response } from "express";
import { error_user_list, success_user_list } from "../lib/i18n";
import { validationResult } from "express-validator";
import ErrDetector from "../debug/ErrorDetector";
require('dotenv').config({ path: ".env" });

const pools = require('../mysql/database.ts');

function RedeemGiftCode(req: Request, res: Response) {
    let api_key = req.headers['api-key'];
    let authorization = req.headers.authorization;

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let giftcode: string = req.body.giftcode;

            //@ts-ignore
            pools.query('SELECT id, email FROM user WHERE BINARY access_token = ?', [authorization], (err, result) => {
                if (err) throw err;
                switch (result[0]) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        let uid: number = result[0].id;
                        let email: string = result[0].email;
                        //@ts-ignore
                        pools.query('SELECT id, is_used FROM giftcard WHERE code = ?', [giftcode], (err, result) => {//check if new giftcode is valid
                            if (err) throw err;
                            let results = result[0];
                            switch (results) {
                                case null: case undefined: case '':
                                    return res.send({ status: false, message: error_user_list.INVALID_GIFTCODE });
                                default:
                                    let newcode_id: number = results.id;
                                    let newcode_is_used: boolean | number = results.is_used;
                                    if (newcode_is_used === false || newcode_is_used === 0) {
                                        //@ts-ignore
                                        pools.query('UPDATE giftcard SET user_id = null, email_used = null WHERE user_id = ?', [uid], (err, result) => { //set null to email_used, user_id before new one
                                            if (err) throw err;
                                            switch (result.changedRows) { 
                                                case 1:
                                                    //@ts-ignore
                                                    pools.query(`UPDATE giftcard SET is_used = 1, user_id = ?, email_used = ?, code_expire = UNIX_TIMESTAMP() + 2592000 WHERE id = ?`, [uid, email, newcode_id], (err, result) => {
                                                        if (err) throw err;
                                                        switch (result.changedRows) {
                                                            case 1:
                                                                //@ts-ignore
                                                                pools.query('UPDATE payment SET giftcard_id = ? WHERE user_id = ?', [newcode_id, uid], (err, result) => {
                                                                    if (err) throw err;
                                                                    switch (result.changedRows) {
                                                                        case 1:
                                                                            return res.send({ status: true, message: success_user_list.SUCCESS_REDEEM_CODE });
                                                                        default:
                                                                            ErrDetector('sql', 'payment', 40);
                                                                            return res.sendStatus(500);
                                                                    }
                                                                });
                                                                return;
                                                            default:
                                                                ErrDetector('sql', 'giftcard', 35);
                                                                return res.sendStatus(500);
                                                        }
                                                    });
                                                    return;
                                                default:
                                                    ErrDetector('sql', 'giftcard', 39);
                                                    return res.sendStatus(500);
                                            }
                                        });
                                        return;
                                    }
                                    return res.send({ status: false, message: error_user_list.DUPLICATE_GIFTCODE });
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

export default RedeemGiftCode;