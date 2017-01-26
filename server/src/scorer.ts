import * as mongodb from "mongodb";
import * as bunyan from "bunyan";
import {Scraper, PersonObject} from "./scraper";
const config = require("../config.js");
let mongoCli = mongodb.MongoClient;

export default class ScoreResolver{
    
    rateTbl:mongodb.Collection;
    uniTbl:mongodb.Collection;
    log: bunyan;
    constructor(log:bunyan){
        this.log = log;

        mongoCli.connect(`mongodb://${config.dbAuth.url}:27017/RMPforQuest`, (err, d) => {
            if(err)
                log.error(err);
            else {
                this.rateTbl = d.collection("ratings");
                this.uniTbl = d.collection("university");
                log.info("Connected to mongodb");
            }
        });
    }

    getScore(university: string, names: string[]):Promise<returnedQuery[]|null>{

        return this.uniTbl.findOne({name: university})
        .then(r => {    
            if(r == null)
                return null;

            let scraper = new Scraper(university);
            return Promise.all(names.map(v => this.rmpGet(v, scraper, university)));
        });
    }

    rmpGet(name: string, scraper: Scraper, university: string):Promise<returnedQuery>{
        // This way the database won't have duplicates due to capitalization
        name = name.toLowerCase();

        return this.rateTbl.findOne({university, name}).then(r => {
                if(r != null){
                    return r;
                } else return scraper.getDataByName(name).then(d => {
                    if(d == null)
                        return null;
                    else{
                        let insertObj = Object.assign({}, d, {name});
                        this.rateTbl.update({name, university}, insertObj, {upsert: true}).catch(e => this.log.error(e));
                        return d;
                    }
                });
        }).catch(e => {
            this.log.error(e);
            return null;
        }).then(data => {
            return {
                queryName: name,
                data
            }
        });
    }
}

interface returnedQuery{
    queryName: String;
    data: PersonObject;
}