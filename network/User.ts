import { Request, Response } from "express";

const pools = require('../mysql/database.ts');

function UserProfile(req: Request, res: Response) {
    let api_key = req.headers['api-key'];
    let authorization = req.headers['authorization'];

    if (api_key === '1234') {
        //@ts-ignore
        pools.query('SELECT id, username, email, is_twofactor FROM user WHERE BINARY access_token = ?', [authorization], (err, result) => {
            if (err) throw err;
            let results = result[0];
            switch (results) {
                case null: case undefined: case '':
                    return res.sendStatus(401);
                default:
                    return res.send({
                        status: true, data: [{
                            id: results.id,
                            username: results.username,
                            email: results.email,
                            is_twofactor: results.is_twofactor
                        }]
                    });
            }
        });
        return;
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

export default UserProfile;