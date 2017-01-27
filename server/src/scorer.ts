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
        names = names.map(v => v.toLowerCase());
        return this.uniTbl.findOne({name: university})
        .then(r => {    
            if(r == null)
                return null;
            
            return this.rateTbl.find({university, name: {$in: names}}).toArray().then((docs: DatabasePerson[]) => {
                if(docs.length == names.length){                    
                    return docs.map(v => Object.assign({}, {data: v}, {queryName: v.name}));
                } else {
                    let scraper = new Scraper(university);
                    let remainingNames = names.filter(item => {
                        return !docs.some(found => found.name == item);
                    });
                    return Promise.all(remainingNames.map(v => this.rmpGet(v, scraper, university)))
                    .then((remain:any) => {
                        return docs.map(v => Object.assign({}, {data: v}, {queryName: v.name})).concat(remain);
                    });
                }
            });
        });
    }
    rmpGet(name: string, scraper: Scraper, university: string):Promise<returnedQuery>{
        return scraper.getDataByName(name).then(d => {
            if(d == null)
                return null;
            else{
                let insertObj = Object.assign({}, d, {name});
                this.rateTbl.insertOne(insertObj);
                return d;
            }
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

interface DatabasePerson extends PersonObject{
    name: string;
}

interface returnedQuery{
    queryName: string;
    data: PersonObject;
}