import { Request, Response } from "express";
import { error_internal_list, success_user_list } from "../lib/i18n";
import { validationResult } from "express-validator";

const pools = require('../mysql/database.ts');

function ActivateTwoFac(req: Request, res: Response) {
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

export default ActivateTwoFac;