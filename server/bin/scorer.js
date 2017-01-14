"use strict";
const mongodb = require("mongodb");
const rmp = require('rmp-api');
let mongoCli = mongodb.MongoClient;
class ScoreResolver {
    constructor(log) {
        this.log = log;
        mongoCli.connect("mongodb://localhost:27017/RMPforQuest", (err, d) => {
            if (err)
                log.error(err);
            else {
                this.rateTbl = d.collection("ratings");
                this.uniTbl = d.collection("university");
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
    rmpGet(name, scraper, University) {
        // This way the database won't have duplicates due to capitalization
        name = name.toLowerCase();
        return new Promise((resolve, reject) => {
            this.rateTbl.findOne({ University, name })
                .then(r => {
                if (r != null) {
                    resolve({
                        queryName: name,
                        data: r
                    });
                }
            }, e => {
                this.log.error(e);
            })
                .then(v => {
                scraper.get(name, (p) => {
                    if (p !== null) {
                        this.rateTbl.insertOne(p);
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