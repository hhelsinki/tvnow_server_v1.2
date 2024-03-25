import { Request, Response } from "express";
import { error_internal_list, error_user_list, success_user_list } from "../lib/i18n";

function ActivateTwoFac(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        let uid: number = req.body.uid;
        let is_enable: boolean = req.body.is_enable;
        //@ts-ignore
        pool.query('UPDATE user SET is_twofactor = ? WHERE BINARY access_token = ?', [is_enable, uid], (err, result) => {
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

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

export default ActivateTwoFac;