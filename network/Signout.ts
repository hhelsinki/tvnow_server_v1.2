import { Request, Response } from "express";
import { error_user_list, success_user_list } from "../lib/i18n";
import ErrDetector from "../debug/ErrorDetector";


function Signout(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        let uid: number = req.body.uid;
        const access_token = randtoken.generate(20);
        //@ts-ignore
        pool.query('UPDATE user SET access_token = ? WHERE user_id = ?', [access_token, uid], (err, result) => {
            if (err) throw err;
            switch (result.changedRows) {
                case 1:
                    let updateNoSql = async () => {
                        await client.connect();
                        const findUser = await collection.find({ user: uid }).toArray();

                        switch (findUser[0]) {
                            case null: case undefined: case '':
                                ErrDetector('nosql', 'list', 19);
                                return res.send({ status: false, message: error_user_list.INVALID_CREDENTIAL });
                            default:
                                await collection.updateOne({ user: uid }, { $set: { token: access_token } });
                                break;
                        }
                    }
                    updateNoSql();
                    return res.send({ status: true, message: success_user_list.SUCCESS_SIGNOUT });
                default:
                    ErrDetector('sql', 'user', 13);
                    return res.sendStatus(500);
            }
        });
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

export default Signout;