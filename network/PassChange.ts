import { Request, Response } from "express";
import { error_internal_list, error_user_list, success_user_list } from "../lib/i18n";
import ErrDetector from "../debug/ErrorDetector";

function ChangePassword(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        let token = req.headers['authorization'];
        let current_password: string = req.body.current_password;
        //@ts-ignore
        pool.query('SELECT id, email FROM user WHERE (BINARY password = ? && BINARY access_token = ?)', [current_password, token], (err, result) => {
            if (err) throw err;
            let results = result[0];
            switch (results) {
                case null: case undefined: case '':
                    return res.send({ status: false, message: error_user_list.INVALID_PASSWORD });
                default:
                    const access_token = randtoken.generate(20);
                    let uid: number = results.id;
                    let email: string = results.email;
                    //@ts-ignore
                    pool.query('UPDATE user SET access_token = ? WHERE user_id = ?', [access_token, uid], (err, result) => {
                        if (err) throw err;
                        switch (result.changedRows) {
                            case 1:
                                SendMailChangePass(email, access_token);
                                return res.send({ status: true, message: success_user_list.SUCCESS_MAIL_CHANGE_PASS });
                            default:
                                ErrDetector('sql', 'user', 66);
                                return res.sendStatus(500);
                        }
                    });
                    break;
            }
        })
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

function UpdatePassword(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        let token = req.headers['authorization'];
        let new_password: string = req.body.new_password;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;

        switch (passwordRegex.test(new_password)) {
            case true:
                //@ts-ignore
                pool.query('SELECT id FROM user WHERE BINARY access_token = ?', token, (err, result) => {
                    if (err) throw err;
                    let results = result[0];
                    switch (results.id) {
                        case null: case undefined: case '':
                            return res.send({ status: false, message: error_user_list.INVALID_TOKEN });
                        default:
                            //@ts-ignore
                            pool.query('UPDATE user SET password = ? WHERE user_id = ?', [password_new, results.id], (err, result) => {
                                if (err) throw err;
                                switch (result.changedRows) {
                                    case 1:
                                        return res.send({ status: false, message: success_user_list.SUCCESS_SAVE_PASSWORD });
                                    default:
                                        ErrDetector('sql', 'user', 24);
                                        return res.send({ status: false, message: error_internal_list.FAILED_SAVE_PASSWORD });
                                }
                            });
                            break;
                    }
                });
                break;
            default:
                return res.send({ status: false, message: error_user_list.INVALID_PASSWORD_REQ });
        }
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

function ForgotPassword(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        let email: string = req.body.email;
        //@ts-ignore
        pool.query('SELECT username, email, password FROM user WHERE email = ?', [email], (err, result) => {
            if (err) throw err;
            let results = result[0];
            switch (result[0]) {
                case null: case undefined: case '':
                    return res.send({ status: false, message: error_user_list.INVALID_EMAIL });
                default:
                    SendMailForgotPass(results.email, results.username, results.password);
                    return res.send({ status: true, message: success_user_list.SUCCESS_MAIL_GET_PASS });
            }
        })
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}


module.exports = { UpdatePassword, ChangePassword, ForgotPassword };