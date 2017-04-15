"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const bunyan = require("bunyan");
const mongodb = require("mongodb");
const scorer_1 = require("./scorer");
const compression = require("compression");
const config = require("../config.js");
const log = bunyan.createLogger({
    name: "RMP-quest",
    streams: [
        { level: "debug", stream: process.stdout },
        { level: "warn", path: "logs.log" }
    ]
});
let mongoCli = mongodb.MongoClient;
let suggestTbl;
let Scorer;
mongoCli.connect(`mongodb://${config.dbAuth.url}:27017/RMPforQuest`, (err, d) => {
    log.info("Connected to mongodb");
    if (err)
        log.error(err);
    else {
        d.authenticate(config.dbAuth.username, config.dbAuth.password, (e, r) => {
            if (e) {
                log.error(e);
                throw e;
            }
            else {
                log.info("Authenticated to mongodb");
                suggestTbl = d.collection("suggest");
                Scorer = new scorer_1.default(log, d);
            }
        });
    }
});
let app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post("/getReviews", (req, res) => {
    let school = req.body.school;
    let names = req.body.names;
    if (school == null || school == "") {
        res.status(300).json({ success: false, body: "Missing school field" });
        log.info("The request was missing the school name");
        return;
    }
    if (names == null || !Array.isArray(names) || names.length == 0) {
        res.status(300).json({ success: false, body: "Missing field names" });
        log.info("The request was missing teacher names");
        return;
    }
    Scorer.getScore(school, names).then(d => {
        if (d == null)
            res.status(300).json({ success: false, body: "School name is invalid" });
        else
            res.json({ success: true, body: d });
    });
});
app.post("/suggest", (req, res) => {
    let { university, name, link } = req.body;
    if (university == null || name == null || link == null) {
        return res.status(300).json({ success: false, message: "missing fields" });
    }
    let regex = /https:\/\/www\.ratemyprofessors\.com\/ShowRatings\.jsp\?tid=\d+/;
    if (!regex.test(link))
        return res.status(300).json({ success: false, message: "invalid link" });
    suggestTbl.findOne({ university, name, link }).then(d => {
        if (d !== null)
            return suggestTbl.updateOne({ university, name, link }, { $inc: { count: 1 } });
        else
            return suggestTbl.insertOne({ university, name, link, count: 1 });
    }).then(d => {
        res.status(200).json({ success: true, message: "Successful" });
    }, e => {
        log.error(e);
        res.status(400).json({ success: false, message: "Our servers messed up" });
    });
});
app.post("*", (req, res) => {
    res.status(400).end("This is not a valid route");
});
app.get("*", (req, res) => {
    res.status(400).end("this is not a valid route");
});
http.createServer(app).listen(config.HTTP_PORT, () => {
    log.info("The HTTP server has been opened on port %d", config.HTTPS_PORT);
});
//# sourceMappingURL=index.js.map