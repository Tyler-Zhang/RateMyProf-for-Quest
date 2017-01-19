"use strict";
const mongodb = require("mongodb");
const rmp = require('rmp-api');
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
            let scraper = rmp(university);
            return Promise.all(names.map(v => this.rmpGet(v, scraper, university)));
        });
    }
    rmpGet(name, scraper, university) {
        // This way the database won't have duplicates due to capitalization
        name = name.toLowerCase();
        return new Promise((resolve, reject) => {
            this.rateTbl.findOne({ university, name })
                .then(r => {
                if (r != null) {
                    resolve({
                        queryName: name,
                        data: r
                    });
                    console.log("fulfilled!!");
                    return { fulfilled: true };
                }
                else
                    return { fulfilled: false };
            }, e => {
                this.log.error(e);
            })
                .then(v => {
                if (v.fulfilled == true)
                    return;
                console.log(v);
                scraper.get(name, (p) => {
                    if (p !== null) {
                        this.rateTbl.insertOne(Object.assign({}, p, { name }));
                    }
                    resolve({
                        queryName: name,
                        data: p
                    });
                });
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScoreResolver;
//# sourceMappingURL=scorer.js.map