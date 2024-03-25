import { Request, Response } from "express";
import { error_user_list } from "../lib/i18n";

function RedeemGiftCode(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        let authorize = req.headers.authorization;
        let giftcode = req.body.giftcode;
        //@ts-ignore
        pool.query(`
        SELECT giftcard.code, giftcard.is_used, giftcard.code_expire, user.id, user.email
        FROM giftcard 
        INNER JOIN user ON giftcard.user_id = user.id
        WHERE BINARY access_token = ?`, [authorize], (err, result) => {
            if (err) throw err;
            switch (result[0]) {
                case null: case undefined: case '':
                    return res.send({ status: false, message: error_user_list.INVALID_TOKEN });
                default:

            }
        });
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}