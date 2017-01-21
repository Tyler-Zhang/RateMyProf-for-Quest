import * as mongodb from "mongodb";
import * as bunyan from "bunyan";
const rmp = require('rmp-api');
const config = require("../config.js");
let mongoCli = mongodb.MongoClient;

export default class ScoreResolver{
    
    rateTbl:mongodb.Collection;
    uniTbl:mongodb.Collection;
    log: bunyan;
    projection = {
        count: 1,
        quality: 1,
        easiness: 1,
        chilli: 1,
        _id: 0
    };

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

    getScore(university:String, names:String[]):Promise<returnedQuery[]|null>{

        return this.uniTbl.findOne({name: university})
        .then(r => {    
            if(r == null)
                return null;

            let scraper = rmp(university);
            return Promise.all(names.map(v => this.rmpGet(v, scraper, university)));
        });
    }

    rmpGet(name:String, scraper: any, university:String):Promise<returnedQuery>{
        // This way the database won't have duplicates due to capitalization
        name = name.toLowerCase();

        return new Promise((resolve, reject) => { 
            this.rateTbl.findOne({university, name}, this.projection)
            .then(r => {
                if(r != null){
                    resolve({
                        queryName: name,
                        data: r
                    });
                    return {fulfilled: true};
                } else return {fulfilled: false};
            }, e => {
                this.log.error(e);
                return {fullfilled: false};
            })
            .then(v => {
                if(v.fulfilled == true)
                    return;

                scraper.get(name, (p:Professor|null) => {
                    if(p !== null){
                        
                        /** Make the names lowercase, counts the amount of ratings */
                        let formattedObj = Object.assign({}, p, {
                            name,
                            fname: p.fname.toLowerCase(), 
                            lname: p.lname.toLowerCase(), 
                            count: p.comments.length,
                            help: undefined,
                            clarity: undefined,
                            grade: undefined
                        });
                        
                        this.rateTbl.update({university, name}, formattedObj, {upsert: true});
                        resolve({
                            queryName: name,
                            data: {
                                count: formattedObj.count,
                                quality: formattedObj.quality,
                                easiness: formattedObj.easiness,
                                chilli: formattedObj.chili
                            }
                        });
                    } else {
                        resolve({
                            queryName: name,
                            data: null
                        });
                    }
                });
            });
        });
    }
}

interface returnedQuery{
    queryName: String;
    data: Professor;
}

interface Professor{
    fname: String;
    lname: String;
    university: String;
    quality: String;
    easiness: String;
    help: String;
    grade: String;
    chili: String;
    url: String;
    comments: String[];
}