"use strict";
const mongodb = require("mongodb");
const rmp = require('rmp-api');
const config = require("../config.js");
let mongoCli = mongodb.MongoClient;
class ScoreResolver {
    constructor(log) {
        this.projection = {
            count: 1,
            quality: 1,
            easiness: 1,
            chilli: 1,
            _id: 0
        };
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
            this.rateTbl.findOne({ university, name }, this.projection)
                .then(r => {
                if (r != null) {
                    resolve({
                        queryName: name,
                        data: r
                    });
                    return { fulfilled: true };
                }
                else
                    return { fulfilled: false };
            }, e => {
                this.log.error(e);
                return { fullfilled: false };
            })
                .then(v => {
                if (v.fulfilled == true)
                    return;
                scraper.get(name, (p) => {
                    if (p !== null) {
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
                        this.rateTbl.update({ university, name }, formattedObj, { upsert: true });
                        resolve({
                            queryName: name,
                            data: {
                                count: formattedObj.count,
                                quality: formattedObj.quality,
                                easiness: formattedObj.easiness,
                                chilli: formattedObj.chili
                            }
                        });
                    }
                    else {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ScoreResolver;
//# sourceMappingURL=scorer.js.map