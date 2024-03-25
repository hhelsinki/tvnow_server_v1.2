import { Request, Response } from "express";
import ErrDetector from "../debug/ErrorDetector";
import { error_user_list } from "../lib/i18n";

function ConfirmSignup(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        let username: string = req.body.username;
        let token: string = req.body.token
        //@ts-ignore
        pool.query('SELECT access_token FROM user WHERE username = ?', [username], (err, result) => {
            if (err) throw err;
            let results = result[0];
            switch (results) {
                case null: case undefined: case '':
                    return res.send({ status: false, message: error_user_list.INVALID_USERNAME });
                default:
                    if (token === results.access_token) {
                        //@ts-ignore
                        pool.query('UPDATE user SET is_verify = 1 WHERE username = ?', [username], (err, result) => {
                            if (err) throw err;
                            switch (result.changedRows) {
                                case 1:
                                    return res.send({ status: true, message: '' });
                                default:
                                    ErrDetector('sql', 'user', 21);
                                    return res.sendStatus(500);
                            }
                        });
                    }
                    if (token != result.access_token) {
                        return res.send({ status: false, message: error_user_list.INVALID_TOKEN });
                    }
                    break;
            }
        })
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

export default ConfirmSignup;