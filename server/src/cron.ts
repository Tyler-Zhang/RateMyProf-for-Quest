import { Db } from 'mongodb'
import { Scraper } from './scraper'
import * as Cronjob from 'node-cron'


export default function initCron (db: Db) {
  const SCRAPE_STEP = 20 // Amount to scrape in parallel at a time

  function delay (time: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), time)
    })
  }

  async function rescrapeScores () {
    let ratingsCol = db.collection('ratingsCol')

    let currPage = 0;

    while (true) {
      console.log('scraping page: ' + currPage)
      const ratings = await ratingsCol.find().limit(SCRAPE_STEP).skip(currPage * SCRAPE_STEP).toArray()

      if (ratings.length == 0) return
      
      await Promise.all(ratings.map(rating => {
        const { university, url } = rating
        return new Scraper(university).getDataByLink(url)
          .then(newRating => {
            if (newRating)
              ratingsCol.updateOne({ _id: rating._id }, newRating)
          })
      }))

      await delay(5000)
    }
  }

  Cronjob.schedule('0 1 * * *', rescrapeScores, true)
}




