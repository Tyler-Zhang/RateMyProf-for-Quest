"use strict";
const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const bunyan = require("bunyan");
const fs = require("fs");
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
let Scorer = new scorer_1.default(log);
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
app.post("*", (req, res) => {
    res.status(400).end("This is not a valid route");
});
app.get("*", (req, res) => {
    res.status(400).end("this is not a valid route");
});
const options = {
    key: fs.readFileSync(config.httpsKeyPath),
    cert: fs.readFileSync(config.httpsCertPath)
};
https.createServer(options, app).listen(8080, () => {
    log.info("The HTTPS server has been opened on port 443");
});
//# sourceMappingURL=index.js.map