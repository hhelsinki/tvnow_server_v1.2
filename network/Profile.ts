import { Request, Response } from "express";
import { validationResult } from "express-validator";
require('dotenv').config({ path: ".env" });

const pools = require('../mysql/database.ts');

function Profile(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let authorization = req.headers['authorization'];
            //@ts-ignore
            pools.query('SELECT id, username, email, is_twofactor FROM user WHERE BINARY access_token = ?', [authorization], (err, result) => {
                if (err) throw err;
                let results = result[0];
                switch (results) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        return res.send({
                            status: true, data: {
                                id: results.id,
                                username: results.username,
                                email: results.email,
                                is_twofactor: results.is_twofactor
                            }
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

export default Profile;