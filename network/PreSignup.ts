import { Request, Response } from "express";
import { error_user_list, success_user_list } from "../lib/i18n";
import { validationResult } from "express-validator";

const pools = require('../mysql/database.ts');

function PreSignup(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let email = req.query.email;
            //@ts-ignore
            pools.query('SELECT code FROM giftcard WHERE email_used = ?', [email], (err, result) => {
                if (err) throw err;
                switch (result[0]) { 
                    case null: case undefined: case '':
                        return res.send({ status: false, message: error_user_list.INVALID_CONFIG });
                    default:
                        let isCodeUsed: boolean | number = result[0].is_used;

                        if (isCodeUsed === 1 || isCodeUsed === true) {
                            return res.send({ status: false, message: error_user_list.DUPLICATE_GIFTCODE });
                        }

                        let userCode = result[0].code;
                        let codeSensor = userCode.replace(/([A-Z0-9]{4})([A-Z0-9]{4})([A-Z0-9]{4})([A-Z0-9]{4})/, '$1-XXXX-XXXX-$4');
                        let codeOutput = codeSensor.replace(/([A-Z0-9]{4})([A-Z0-9]{4})([A-Z0-9]{4})([A-Z0-9]{4})/, '$1-$2-$3-$4');
                        return res.send({
                            status: true,
                            data: {
                                payment: 'Giftcard',
                                code: codeOutput
                            },
                            message: success_user_list.VALID_GIFTCODE
                        });
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

export default PreSignup;