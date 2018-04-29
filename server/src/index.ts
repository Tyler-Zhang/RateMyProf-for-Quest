import * as dotenv from 'dotenv' 
dotenv.config()
import * as http from "http";
import * as express from "express";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as bunyan from "bunyan";
import * as mongodb from "mongodb";
import * as fs from "fs";
import ScoreResolver from "./scorer";
import InitCron from './cron'

const compression = require("compression");
const log = bunyan.createLogger({
  name: "RMP-quest",
  streams: [
    { level: "debug", stream: process.stdout },
    { level: "warn", path: "logs.log" }
  ]
});
let mongoCli = mongodb.MongoClient;
let suggestTbl: mongodb.Collection;
let Scorer: ScoreResolver;

mongoCli.connect(process.env.DB_URL as string, (err, d) => {
  log.info("Connected to mongodb");
  if (err) {
    log.error(err);
    throw err
  }
  suggestTbl = d.collection("suggest");
  Scorer = new ScoreResolver(log, d);
  InitCron(d)
});

let app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/getReviews", (req, res, next) => {
  let school: string = req.body.school;
  let names: string[] = req.body.names;

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

  return Scorer.getScore(school, names).then(d => {
    if (d == null)
      res.status(300).json({ success: false, body: "School name is invalid" });

    else res.json({ success: true, body: d });
  })
  .catch(next)

});

app.post("/suggest", async (req, res, next) => {
  let { university, name, link } = req.body;

  if (university == null || name == null || link == null) {
    return res.status(300).json({ success: false, message: "missing fields" });
  }

  let regex = /https:\/\/www\.ratemyprofessors\.com\/ShowRatings\.jsp\?tid=\d+/;
  if (!regex.test(link)) {
    return res.status(300).json({ success: false, message: "invalid link" });
  }

  try {

    const suggestion = await suggestTbl.findOne({ university, name, link })
    if(suggestion) {
      await suggestTbl.updateOne({ university, name, link }, { $inc: { count: 1 } });
    } else {
      await suggestTbl.insertOne({ university, name, link, count: 1 });
    }
    
    return res.json({success: true, message: 'Successful'})
  } catch (e) {
    return next(e)
  }

});

app.listen(process.env.PORT as string, () => {
  log.info("The HTTP server has been opened on port %d", process.env.PORT);
});


