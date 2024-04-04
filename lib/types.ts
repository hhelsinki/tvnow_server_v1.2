export type CTTypes = { title: string, img: string, url: string }
export interface CTProps { [key: string]: { title: string, img: string, url: string } }

type ShowEPType = { ep: string, img: string, url: string }
type ShowSSType = { season: string, img: string, url: string }
type MovieInfoTypes = {
    title: string,
    story: string,
    poster_mb: string,
    poster_tb: string,
    poster_pc: string,
    genre: string,
    year: string,
    starring: string,
    country: string,
    yt: string
}
type ShowInfoTypes = {
    title: string,
    season: string,
    story: string,
    poster_mb: string,
    poster_tb: string,
    poster_pc: string,
    genre: string,
    year: string,
    starring: string,
    country: string,
    yt: string
}

export interface MovieDetailProps {
    [key: string]: {
        info: MovieInfoTypes,
        related: CTTypes[]
    }
}
export interface ShowDetailProps {
    [key: string]: {
        info: ShowInfoTypes,
        allEPs: ShowEPType[],
        allSeasons: ShowSSType[],
        related: CTTypes[]
    }
}