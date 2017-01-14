import * as mongodb from "mongodb";
import * as bunyan from "bunyan";
const rmp = require('rmp-api');
let mongoCli = mongodb.MongoClient;

export default class ScoreResolver{
    
    rateTbl:mongodb.Collection;
    uniTbl:mongodb.Collection;
    log: bunyan;

    constructor(log:bunyan){
        this.log = log;

        mongoCli.connect("mongodb://localhost:27017/RMPforQuest", (err, d) => {
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
        })   
    }

    rmpGet(name:String, scraper: any, university:String):Promise<returnedQuery>{
        // This way the database won't have duplicates due to capitalization
        name = name.toLowerCase();

        return new Promise((resolve, reject) => {
            this.rateTbl.findOne({university, name})
            .then(r => {
                if(r != null){
                    resolve({
                        queryName: name,
                        data: r
                    });
                    console.log("fulfilled!!");
                    return {fulfilled: true};
                } else return {fulfilled: false};
            }, e => {
                this.log.error(e);
            })
            .then(v => {
                if(v.fulfilled == true)
                    return;
                
                console.log(v);
                scraper.get(name, (p:Professor|null) => {
                    if(p !== null){
                        this.rateTbl.insertOne(Object.assign({}, p, {name}));
                    }
                    resolve({
                        queryName: name,
                        data: p
                    });
                })
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