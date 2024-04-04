import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { error_internal_list, success_user_list } from "../lib/i18n";
import ErrDetector from "../debug/ErrorDetector";

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: ".env" });

const url = process.env.DEVELOP_MONGO_URL;
const client = new MongoClient(url);
const dbName = process.env.DEVELOP_MONGO;
const collection = client.db(dbName).collection(process.env.DEVELOP_MONGO_COLL);

async function FindFavourByParam(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let authorization = req.headers['authorization'];
            let title: string = req.params.title;
            await client.connect();
            const findResult = await collection.find({ token: authorization }).toArray();

            switch (findResult[0]) {
                case null: case undefined: case '':
                    return res.sendStatus(401);
                default:
                    switch (findResult[0][title]) {
                        case null: case undefined: case '':
                            return res.send({ status: true, data: { is_favour: false } });
                        default:
                            return res.send({ status: true, data: { is_favour: true } });
                    }
            }
        }
        return res.send({ status: false, message: result.array() });
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

async function SaveFavourite(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);
        if (result.isEmpty()) {
            let authorization = req.headers['authorization'];
            let title: string = req.params.title;
            let is_favour: boolean = req.body.is_favour;

            await client.connect();
            const findUser = await collection.find({ token: authorization }).toArray();

            switch (findUser[0]) {
                case null: case undefined: case '':
                    return res.sendStatus(401);
                default:
                    const updateResult = await collection.updateOne({ token: authorization }, { $set: { [title]: is_favour } });

                    switch (updateResult.modifiedCount) {
                        case 1:
                            const updated_result = await collection.find({ token: authorization }).toArray();
                            let results = updated_result[0];
                            switch (results[title]) { //find boolean value in title
                                case true:
                                    await collection.updateOne({ token: authorization }, { $addToSet: { 'data': { title: title } } });
                                    return res.send({ status: true, message: success_user_list.SUCCESS_SAVE_FAVOUR });
                                case false:
                                    await collection.updateOne({ token: authorization }, { $pull: { 'data': { title: title } } });
                                    return res.send({ status: true, message: success_user_list.SUCCESS_SAVE_FAVOUR });
                                default:
                                    ErrDetector('nosql', 'favourite list', 70);
                                    return res.send({ status: false, message: error_internal_list.FAILED_SAVE_FAVOUR });

                            }
                        default:
                            ErrDetector('nosql', 'favourite list', 63);
                            return res.send({ status: false, message: error_internal_list.FAILED_SAVE_FAVOUR });
                    }
            }
        }
        return res.send({ status: false, message: result.array() });
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

async function GetFavourList(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let authorization = req.headers['authorization'];
            await client.connect();
            const findUser = await collection.find({ token: authorization }).toArray();
            let results = findUser[0];

            switch (results) {
                case null: case undefined: case '':
                    return res.sendStatus(401);
                default:
                    return res.send({ status: true, data: results.data });
            }
        }
        return res.send({ status: false, message: result.array() });
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

module.exports = { FindFavourByParam, SaveFavourite, GetFavourList };