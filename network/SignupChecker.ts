import { Request, Response } from "express";
import { error_user_list } from "../lib/i18n";

function CheckUsername(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        let username: string = req.body.username;
        //@ts-ignore
        pool.query(`SELECT id FROM user WHERE username = ?`, [username], (err, result) => {
            if (err) throw err;
            switch (result[0]) {
                case null: case undefined: case '':
                    //@ts-ignore
                    return res.send({ status: false, message: error_user_list.DUPLICATE_USERNAME });
                default:
                    return res.send({ status: true, message: '' });
            }
        });
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

function CheckEmail(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        let email: string = req.body.email;
        //@ts-ignore
        pool.query(`SELECT id FROM user WHERE email = ?`, [email], (err, result) => {
            if (err) throw err;
            switch (result[0]) {
                case null: case undefined: case '':
                    //@ts-ignore
                    return res.send({ status: false, message: error_user_list.DUPLICATE_EMAIL });
                default:
                    return res.send({ status: true, message: '' });
            }
        });
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

function CheckGiftcode(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        let giftcode = req.body.giftcode;
        //@ts-ignore
        pool.query('SELECT is_used FROM giftcard WHERE code = ?', [giftcode], (err, result) => {
            if (err) throw err;
            switch (result[0]) {
                case null: case undefined: case '':
                    return res.send({ status: false, message: error_user_list.INVALID_GIFTCODE });
                default:
                    switch (result[0].is_used) {
                        case 0:
                            return res.send({ status: true, message: '' });
                        default:
                            return res.send({ status: false, message: error_user_list.DUPLICATE_GIFTCODE });
                    }
            }
        })
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

module.exports = { CheckUsername, CheckEmail, CheckGiftcode };