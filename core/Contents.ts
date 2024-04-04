import { Request, Response } from "express";
import { CTProps, CTTypes, MovieDetailProps, ShowDetailProps } from "../lib/types";
import { validationResult } from "express-validator";
import { error_user_list } from "../lib/i18n";
require('dotenv').config({ path: ".env" });

const pools = require('../mysql/database');

//import json
const originHome = require('../lib/contents/content-home');
const originMovies = require('../lib/contents/cate-movies.ts');
const originShows = require('../lib/contents/cate-shows.ts');
const originContentShows = require('../lib/contents/content-shows.ts');
const originContentMovies = require('../lib/contents/content-movies.ts');
const originContentAll = require('../lib/contents/content-all.ts');
const originCateAction = require('../lib/contents/cate-action.ts');
const originCateCartoon = require('../lib/contents/cate-cartoon.ts');
const originCateComedy = require('../lib/contents/cate-comedy.ts');
const originCateCrime = require('../lib/contents/cate-crime.ts');
const originCateDrama = require('../lib/contents/cate-drama.ts');
const originCateFantasy = require('../lib/contents/cate-fantasy.ts');
const originCateHorror = require('../lib/contents/cate-horror.ts');
const originCateLGBTQ = require('../lib/contents/cate-lgbtq.ts');
const originCateRomance = require('../lib/contents/cate-romance.ts');
const originCateSciFi = require('../lib/contents/cate-sci-fi.ts');
const originCateSuspense = require('../lib/contents/cate-suspense.ts');
const originCateThriller = require('../lib/contents/cate-thriller.ts');

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
                            else if ((limit > 0) && (limit > range)) {
                                status = true;
                                totalPage = 0;
                                output = getJson;
                            }
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
var getAction = new JsonLimit(action);
var getCartoon = new JsonLimit(cartoon);
var getComedy = new JsonLimit(comedy);
var getCrime = new JsonLimit(crime);
var getDrama = new JsonLimit(drama);
var getFantasy = new JsonLimit(fantasy);
var getHorror = new JsonLimit(horror);
var getLgbtq = new JsonLimit(lgbtq);
var getRomance = new JsonLimit(romance);
var getScifi = new JsonLimit(scifi);
var getSuspense = new JsonLimit(suspense);
var getThriller = new JsonLimit(thriller);
var getShowcase = new JsonAll(showcase);


function SearchAllByNameQuery(req: Request, res: Response) {
    let api_key = req.headers['api-key'];

    if (api_key === '1234') {
        const result = validationResult(req);

        if (result.isEmpty()) {
            let authorization = req.headers['authorization'];
            let name = req.query.name;
            //@ts-ignore
            pools.query('SELECT id FROM user WHERE BINARY access_token = ?', [authorization], (err, result) => {
                if (err) throw err;
                switch (result[0]) {
                    case null: case undefined: case '':
                        return res.sendStatus(401);
                    default:
                        if (contentAll[`${name}`] === null || contentAll[`${name}`] === undefined || contentAll[`${name}`] === '') {
                            return res.send({ status: false, data: error_user_list.NOTFOUND_CONTENT });
                        }
                        let content_results = contentAll[`${name}`];
                        return res.send({ status: true, data: content_results });
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
                        if (contentShows[name] === null || contentShows[name] === undefined || contentShows[name] === '') {
                            return res.send({ status: false, message: error_user_list.NOTFOUND_CONTENT });
                        }
                        return res.send({ status: true, data: contentShows[name] });
                }
            });
            return;

        }
        if (contentShows[name] === null || contentShows[name] === undefined || contentShows[name] === '') {
            return res.send({ status: false, message: error_user_list.NOTFOUND_CONTENT });
        }

        let show_results = contentShows[name];
        let show_info = show_results.info;
        let show_eps = show_results.allEPs;
        let show_ss = show_results.allSeasons;
        let show_related = show_results.related;

        const info_sliced = Object.keys(show_info).slice(0, 10).reduce((result, key) => {
            //@ts-ignore
            result[key] = show_info[key];
            return result;
        }, {});

        return res.send({
            status: true,
            data: {
                info: info_sliced,
                show_eps,
                show_ss,
                show_related
            },
            message: error_user_list.INVALID_CREDENTIAL
        }); //do not show youtube url
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
                        if (contentMovies[name] === null || contentMovies[name] === undefined || contentMovies[name] === '') {
                            return res.send({ status: false, message: error_user_list.NOTFOUND_CONTENT });
                        }
                        return res.send({ status: true, data: contentMovies[name] });
                }
            });
            return;
        }
        if (contentMovies[name] === null || contentMovies[name] === undefined || contentMovies[name] === '') {
            return res.send({ status: false, message: error_user_list.NOTFOUND_CONTENT });
        }

        let movie_results = contentMovies[name];
        let movie_info = movie_results.info;
        let movie_related = movie_results.related;

        const info_sliced = Object.keys(movie_info).slice(0, 9).reduce((result, key) => {
            //@ts-ignore
            result[key] = movie_info[key];
            return result;
        }, {});

        return res.send({
            status: true,
            data: {
                info: info_sliced,
                movie_related
            },
            message: error_user_list.INVALID_CREDENTIAL
        }); //do not show youtube url
    }

    if (api_key != '1234') {
        return res.sendStatus(402);
    }
}

let GetShowcaseAll = getShowcase.onCalculate.bind(getShowcase);
let GetTrendByOffset = getTrending.onCalculate.bind(getTrending);
let GetMostWatchByOffset = getMostWatch.onCalculate.bind(getMostWatch);
let GetRecentByOffset = getRecentAdd.onCalculate.bind(getRecentAdd);
let GetExclusiveByOffset = getExclusive.onCalculate.bind(getExclusive);
let GetShowByOffset = getMovies.onCalculate.bind(getShows);
let GetMovieByOffset = getMovies.onCalculate.bind(getMovies);
let GetActionByOffset = getAction.onCalculate.bind(getAction);
let GetCartoonByOffset = getCartoon.onCalculate.bind(getCartoon);
let GetComedyByOffset = getComedy.onCalculate.bind(getComedy);
let GetCrimeByOffset = getCrime.onCalculate.bind(getCrime);
let GetDramaByOffset = getDrama.onCalculate.bind(getDrama);
let GetFantasyByOffset = getFantasy.onCalculate.bind(getFantasy);
let GetHorrorByOffset = getHorror.onCalculate.bind(getHorror);
let GetLgbtqByOffset = getLgbtq.onCalculate.bind(getLgbtq);
let GetRomanceByOffset = getRomance.onCalculate.bind(getRomance);
let GetScifiByOffset = getScifi.onCalculate.bind(getScifi);
let GetSuspenseByOffset = getSuspense.onCalculate.bind(getSuspense);
let GetThrillerByOffset = getThriller.onCalculate.bind(getThriller);

module.exports = { SearchAllByNameQuery, GetShowByNameParam, GetMovieByNameParam, GetShowcaseAll, GetTrendByOffset, GetMostWatchByOffset, GetRecentByOffset, GetExclusiveByOffset, GetShowByOffset, GetMovieByOffset, GetActionByOffset, GetCartoonByOffset, GetComedyByOffset, GetCrimeByOffset, GetDramaByOffset, GetFantasyByOffset, GetHorrorByOffset, GetLgbtqByOffset, GetRomanceByOffset, GetScifiByOffset, GetSuspenseByOffset, GetThrillerByOffset };