import { Request, Response } from "express";
import { CTProps, CTTypes, MovieDetailProps, ShowDetailProps } from "../lib/types";
import { validationResult } from "express-validator";

const pools = require('../mysql/database');

//import json
const originHome: CTTypes = require('../lib/contents/content-home');
const originMovies: CTTypes = require('../lib/contents/cate-movies.ts');
const originShows: CTTypes = require('../lib/contents/cate-shows.js');
const originContentShows: ShowDetailProps = require('../lib/contents/content-shows.js');
const originContentMovies: MovieDetailProps = require('../lib/contents/content-movies.js');
const originContentAll: CTProps = require('../lib/contents/content-all.js');
const originCateAction: CTTypes = require('../lib/contents/cate-action.js');
const originCateCartoon: CTTypes = require('../lib/contents/cate-cartoon.js');
const originCateComedy: CTTypes = require('../lib/contents/cate-comedy.js');
const originCateCrime: CTTypes = require('../lib/contents/cate-crime.js');
const originCateDrama: CTTypes = require('../lib/contents/cate-drama.js');
const originCateFantasy: CTTypes = require('../lib/contents/cate-fantasy.js');
const originCateHorror: CTTypes = require('../lib/contents/cate-horror.js');
const originCateLGBTQ: CTTypes = require('../lib/contents/cate-lgbtq.js');
const originCateRomance: CTTypes = require('../lib/contents/cate-romance.js');
const originCateSciFi: CTTypes = require('../lib/contents/cate-sci-fi.js');
const originCateSuspense: CTTypes = require('../lib/contents/cate-suspense.js');
const originCateThriller: CTTypes = require('../lib/contents/cate-thriller.js');

//origin json
const showcase = originHome.showcase;
const trending = originHome.trending;
const mostWatch = originHome.mostWatching;
const recentAdd = originHome.recentAdd;
const exclusive = originHome.exclusive;
const movies = originMovies.movies;
const shows = originShows.shows;
const contentShows = originContentShows.contentShows;
const contentMovies = originContentMovies.contentMovies;
const contentAll = originContentAll.contentsAll;
const action = originCateAction.action;
const cartoon = originCateCartoon.cartoon;
const comedy = originCateComedy.comedy;
const crime = originCateCrime.crime;
const drama = originCateDrama.drama;
const fantasy = originCateFantasy.fantasy;
const horror = originCateHorror.horror;
const lgbtq = originCateLGBTQ.lgbtq;
const romance = originCateRomance.romance;
const scifi = originCateSciFi.scifi;
const suspense = originCateSuspense.suspense;
const thriller = originCateThriller.thriller;

//Copy Json
const trendingCopy = trending;
const mostWatchCopy = mostWatch;
const recentAddCopy = recentAdd;
const exclusiveCopy = exclusive;
const moviesCopy = movies;
const showsCopy = shows;

//class function
class JsonLimit {
    mainJson: any;
    constructor(mainJson: any) {
        this.mainJson = mainJson;
    }

    onCalculate(req: Request, res: Response) {
        const getJson = this.mainJson;
        let api_key = req.headers['api-key'];
        let limit_str = req.query.limit;
        let page_str = req.query.page;
        const limit: number = Number(limit_str);
        const page: number = Number(page_str);
        let range: number = getJson.length;
        const remain_mod: number = range % limit;
        const remain_devided_float: number = range / limit;
        const remain_devided_int: number = Math.floor(remain_devided_float);
        let totalPage: number;
        let status: boolean;
        var output: string[] = [];

        if (api_key === '1234') {
            const result = validationResult(req);

            if (result.isEmpty()) {
                let authorization = req.headers['authorization'];
                //@ts-ignore
                pools.query('SELECT id FROM user WHERE BINARY access_token = ?', [authorization], (err, result) => {
                    if (err) throw err;
                    switch (result[0]) {
                        case null: case undefined: case '':
                            return res.sendStatus(401);
                        default:
                            if ((limit > 0) && (limit <= range)) {
                                //check remain step: II
                                if ((range) % limit === 0) {
                                    //console.log('no remain');
                                    totalPage = remain_devided_int - 1;
                                    //console.log('totalPage: ' + totalPage)
                                    //normal push logic
                                    //page = total page
                                    //page > total page
                                    if (page <= totalPage) {
                                        //normal push
                                        for (let i = 0; i < range - (range - (limit * (page + 1))); i++) { //pass
                                            if (i > -1 + (limit * page)) {
                                                status = true;
                                                output.push(getJson[i]);
                                            }
                                        }
                                    }
                                    if (page > totalPage) {
                                        //console.log('out of page, no push')
                                        status = false;
                                        output = ['reach out of page, no more content'];
                                    }
                                    if (page < 0) {
                                        //console.log('wrong input page')
                                        output = ['page must start with 0'];
                                    }
                                }
                                if ((range) % limit >= 1) {
                                    //console.log('got remain')
                                    //abnormal push logic
                                    //final
                                    totalPage = remain_devided_int;
                                    //console.log('totalPage: ' + totalPage)

                                    if (page === totalPage) {
                                        //console.log('page = totalPage')
                                        //abnormal push
                                        //console.log('abnormal push')
                                        for (let i = 0; i < range; i++) {
                                            if ((i > (range - 1) - remain_mod) && (i <= range)) {
                                                status = true;
                                                output.push(getJson[i])
                                            }

                                        }
                                    }
                                    if ((page >= 0) && (page < totalPage)) {
                                        //normal push
                                        //console.log('normal push')
                                        for (let i = 0; i < range - (range - (limit * (page + 1))); i++) { //pass
                                            if (i > -1 + (limit * page)) {
                                                status = true;
                                                output.push(getJson[i])
                                            }
                                        }
                                    }
                                    if (page > totalPage) {
                                        //no push
                                        //console.log('out of page, no push')
                                        status = false;
                                        output = ['no more content'];
                                    }
                                    if (page < 0) {
                                        output = ['page must be start with 0'];
                                    }
                                }
                                if ((range) % limit <= -1) {
                                    //console.log('nan remain something broke')
                                    //no push
                                }

                                //console.log('limit pass')
                            }
                            else {
                                //console.log(`limit must less than or equal ${range}`)
                            }
                            //console.log(range)
                            //console.log('+++')

                            return res.send({ status: status, page_end: totalPage, page_start: 0, results: output });
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
}

class JsonAll {
    mainJson: any
    constructor(mainJson: any) {
        this.mainJson = mainJson;
    }

    onCalculate(req: Request, res: Response) {
        const getJson = this.mainJson;
        let api_key = req.headers['api-key'];

        if (api_key === '1234') {
            const result = validationResult(req);

            if (result.isEmpty()) {
                let authorization = req.headers['authorization'];
                //@ts-ignore
                pools.query('SELECT id FROM user WHERE BINARY access_token = ?', [authorization], (err, result) => {
                    if (err) throw err;
                    switch (result[0]) {
                        case null: case undefined: case '':
                            return res.sendStatus(401);
                        default:
                            return res.send({ status: true, data: getJson });
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
}

//Run Class function
var getTrending = new JsonLimit(trendingCopy);
var getMostWatch = new JsonLimit(mostWatchCopy);
var getRecentAdd = new JsonLimit(recentAddCopy);
var getExclusive = new JsonLimit(exclusiveCopy);
var getMovies = new JsonLimit(moviesCopy);
var getShows = new JsonLimit(showsCopy);

var getShowcase = new JsonAll(showcase);
var getAction = new JsonAll(action);
var getCartoon = new JsonAll(cartoon);
var getComedy = new JsonAll(comedy);
var getCrime = new JsonAll(crime);
var getDrama = new JsonAll(drama);
var getFantasy = new JsonAll(fantasy);
var getHorror = new JsonAll(horror);
var getLgbtq = new JsonAll(lgbtq);
var getRomance = new JsonAll(romance);
var getScifi = new JsonAll(scifi);
var getSuspense = new JsonAll(suspense);
var getThriller = new JsonAll(thriller);

function GetAllByNameQuery(req: Request, res: Response) {
    let api_key = req.headers['api-key'];
    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let authorization = req.headers.authorization;
            let name = req.query.name;

            pools.query('SELECT id FROM user WHERE BINARY access_token = ?', [authorization], (err, result) => {
                if (err) throw err;
                switch (result[0]) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        return res.send({ status: true, data: contentAll[name] });
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

function GetShowByNameParam(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);
        let name: string = req.params.name;

        if (result.isEmpty()) {
            let authorization = req.headers['authorization'];
            //@ts-ignore
            pools.query('SELECT id FROM user WHERE access_token = ?', [authorization], (err, result) => {
                if (err) throw err;
                switch (result[0]) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        return res.send({ status: true, data: contentShows[name] });
                }
            });
            return;

        }
        return res.send({ status: true, data: contentShows[name], remark: 'Login is requried.' }); //do not show youtube url
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}
function GetMovieByNameParam(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);
        let name: string = req.params.name;

        if (result.isEmpty()) {
            let authorization = req.headers['authorization'];
            //@ts-ignore
            pools.query('SELECT id FROM user WHERE access_token = ?', [authorization], (err, result) => {
                if (err) throw err;
                switch (result[0]) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        return res.send({ status: true, data: contentMovies[name] });
                }
            });
            return;

        }
        return res.send({ status: true, data: contentMovies[name], remark: 'Login is requried.' }); //do not show youtube url
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

let GetTrendingLimit = getTrending.onCalculate.bind(getTrending);
let GetMostWatchLimit = getMostWatch.onCalculate.bind(getMostWatch);
let GetRecentAddLimit = getRecentAdd.onCalculate.bind(getRecentAdd);
let GetExclusiveLimit = getExclusive.onCalculate.bind(getExclusive);
let GetShowsLimit = getMovies.onCalculate.bind(getShows);
let GetMoviesLimit = getMovies.onCalculate.bind(getMovies);
let GetShowcaseAll = getShowcase.onCalculate.bind(getShowcase);
let GetActionAll = getAction.onCalculate.bind(getAction);
let GetCartoonAll = getCartoon.onCalculate.bind(getCartoon);
let GetComedyAll = getComedy.onCalculate.bind(getComedy);
let GetCrimeAll = getCrime.onCalculate.bind(getCrime);
let GetDramaAll = getDrama.onCalculate.bind(getDrama);
let GetFantasyAll = getFantasy.onCalculate.bind(getFantasy);
let GetHorrorAll = getHorror.onCalculate.bind(getHorror);
let GetLgbtqAll = getLgbtq.onCalculate.bind(getLgbtq);
let GetRomanceAll = getRomance.onCalculate.bind(getRomance);
let GetScifiAll = getScifi.onCalculate.bind(getScifi);
let GetSuspenseAll = getSuspense.onCalculate.bind(getSuspense);
let GetThrillerAll = getThriller.onCalculate.bind(getThriller);

module.exports = { GetAllByNameQuery, GetShowByNameParam, GetMovieByNameParam, GetTrendingLimit, GetMostWatchLimit, GetRecentAddLimit, GetExclusiveLimit, GetShowsLimit, GetMoviesLimit, GetShowcaseAll, GetActionAll, GetCartoonAll, GetComedyAll, GetCrimeAll, GetDramaAll, GetFantasyAll, GetHorrorAll, GetLgbtqAll, GetRomanceAll, GetScifiAll, GetSuspenseAll, GetThrillerAll };