
import * as http from "http";
import * as express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as bunyan from "bunyan";
import ScoreResolver from "./scorer";

const compression = require("compression");
const log = bunyan.createLogger({
    name: "RMP-quest",
    streams: [
        {level: "debug", stream: process.stdout},
        {level: "warn", path: "logs.log"}
    ]
});

let Scorer = new ScoreResolver(log);

let app = express();
app.use(compression());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post("/getReviews", (req, res) => {
    let school:String = req.body.school;
    let names:String[] = req.body.names;

    if(school == null || school == ""){
        res.status(300).json({success: false, message: "Missing school field"});
        log.info("The request was missing the school name");
        return;
    }

    if(names == null || !Array.isArray(names) || names.length == 0){
        res.status(300).json({success:false, message: "Missing field names"});
        log.info("The request was missing teacher names");
        return;
    }

    Scorer.getScore(school, names).then( d => {
        if(d == null)
            res.status(300).json({success:false, message: "School name is invalid"});
        
        else res.json(d);
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
})

