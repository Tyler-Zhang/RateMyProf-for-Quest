"use strict";
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const bunyan = require("bunyan");
const scorer_1 = require("./scorer");
const compression = require("compression");
const log = bunyan.createLogger({
    name: "RMP-quest",
    streams: [
        { level: "debug", stream: process.stdout },
        { level: "warn", path: "logs.log" }
    ]
});
let Scorer = new scorer_1.default(log);
let app = express();
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
        console.log(d);
    });
});
app.post("*", (req, res) => {
    res.status(400).end("This is not a valid route");
});
app.get("*", (req, res) => {
    res.status(400).end("this is not a valid route");
});
http.createServer(app).listen(80, () => {
    log.info("The server has been opened on port 80");
});
//# sourceMappingURL=index.js.map