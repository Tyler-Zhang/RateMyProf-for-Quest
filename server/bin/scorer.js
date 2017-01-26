"use strict";
const mongodb = require("mongodb");
const scraper_1 = require("./scraper");
const config = require("../config.js");
let mongoCli = mongodb.MongoClient;
class ScoreResolver {
    constructor(log) {
        this.log = log;
        mongoCli.connect(`mongodb://${config.dbAuth.url}:27017/RMPforQuest`, (err, d) => {
            if (err)
                log.error(err);
            else {
                this.rateTbl = d.collection("ratings");
                this.uniTbl = d.collection("university");
                log.info("Connected to mongodb");
            }
        });
    }
    getScore(university, names) {
        return this.uniTbl.findOne({ name: university })
            .then(r => {
            if (r == null)
                return null;
            let scraper = new scraper_1.Scraper(university);
            return Promise.all(names.map(v => this.rmpGet(v, scraper, university)));
        });
    }
    rmpGet(name, scraper, university) {
        // This way the database won't have duplicates due to capitalization
        name = name.toLowerCase();
        return this.rateTbl.findOne({ university, name }).then(r => {
            if (r != null) {
                return r;
            }
            else
                return scraper.getDataByName(name).then(d => {
                    if (d == null)
                        return null;
                    else {
                        let insertObj = Object.assign({}, d, { name });
                        this.rateTbl.update({ name, university }, insertObj, { upsert: true }).catch(e => this.log.error(e));
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
            };
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScoreResolver;
//# sourceMappingURL=scorer.js.map