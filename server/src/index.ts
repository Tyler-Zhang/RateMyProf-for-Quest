import * as http from "http";
import * as https from "https";
import * as express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as bunyan from "bunyan";
import * as mongodb from "mongodb";
import * as fs from "fs";
import ScoreResolver from "./scorer";

const compression = require("compression");
const config = require("../config.js");
const log = bunyan.createLogger({
    name: "RMP-quest",
    streams: [
        {level: "debug", stream: process.stdout},
        {level: "warn", path: "logs.log"}
    ]
});
let mongoCli = mongodb.MongoClient;
let suggestTbl: mongodb.Collection;
mongoCli.connect(`mongodb://${config.dbAuth.url}:27017/RMPforQuest`, (err, d) =>{
    if(err)
        log.error(err);
    else {
        d.authenticate(config.dbAuth.username, config.dbAuth.password, (e, r)=>{
            if(e){
                log.error(e);
                throw e;
            } else {
                suggestTbl = d.collection("suggest");
                log.info("Connected to mongodb");
            }
        });
    }
});

let Scorer = new ScoreResolver(log);

let app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(compression());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post("/getReviews", (req, res) => {
    let school: string = req.body.school;
    let names: string[] = req.body.names;

    if(school == null || school == ""){
        res.status(300).json({success: false, body: "Missing school field"});
        log.info("The request was missing the school name");
        return;
    }

    if(names == null || !Array.isArray(names) || names.length == 0){
        res.status(300).json({success:false, body: "Missing field names"});
        log.info("The request was missing teacher names");
        return;
    }

    Scorer.getScore(school, names).then( d => {
        if(d == null)
            res.status(300).json({success:false, body: "School name is invalid"});
        
        else res.json({success: true, body: d});
    });
    
});

app.post("/suggest", (req, res) => {
    let {university, name, link} = req.body;

    if(university == null || name == null || link == null){
        return res.status(300).json({success: false, message: "missing fields"});
    }

    let regex = /https:\/\/www\.ratemyprofessors\.com\/ShowRatings\.jsp\?tid=\d+/;
    if(!regex.test(link))
        return res.status(300).json({success: false, message: "invalid link"});
    
    suggestTbl.findOne({university, name, link}).then(d => {
        if(d !== null)
            return suggestTbl.updateOne({university, name, link}, {$inc: {count: 1}});
        else
            return suggestTbl.insertOne({university, name, link, count: 1});
    }).then(d => {
        res.status(200).json({success: true, message: "Successful"});
    }, e => {
        log.error(e);
        res.status(400).json({success: false, message: "Our servers messed up"});
    })


});

app.post("*", (req, res) => {
    res.status(400).end("This is not a valid route");
});

app.get("*", (req, res) => {
    res.status(400).end("this is not a valid route");
});

http.createServer(app).listen(config.HTTP_PORT, ()=>{
        log.info("The HTTP server has been opened on port %d", config.HTTPS_PORT);
});


