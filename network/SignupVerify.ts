import { Request, Response } from "express";
import ErrDetector from "../debug/ErrorDetector";
import { error_user_list } from "../lib/i18n";
import { validationResult } from "express-validator";

function VerifySignup(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let token = req.query.token;
            //@ts-ignore
            pools.query('SELECT id, is_verify FROM user WHERE BINARY access_token = ?', [token], (err, result) => {//check if is_verify = 0
                if (err) throw err;
                let results = result[0];
                switch (results) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        if (results.is_verify === false || results.is_verify === 0) {
                            let uid: number = results.id;
                            //@ts-ignore
                            pools.query('SELECT giftcard_id FROM payment WHERE user_id = ?', [uid], (err, result) => {//check if user is paid by payment find user_id = uid
                                if (err) throw err;
                                switch (result[0]) {
                                    case null: case undefined: case '':
                                        return res.send({ status: false, message: error_user_list.INVALID_PAYMENT });
                                    default:
                                        //@ts-ignore
                                        pools.query('UPDATE user SET is_verify = 1 WHERE id = ?', [uid], (err, result) => {//update is_verify = 1
                                            if (err) throw err;
                                            switch (result.changedRows) {
                                                case 1:
                                                    return res.send({ status: true, message: '' });
                                                default:
                                                    ErrDetector('sql', 'user', 32);
                                                    return res.sendStatus(500);
                                            }
                                        });
                                        return;
                                }
                            });
                            return;
                        }
                        return res.sendStatus(403);
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

export default VerifySignup;