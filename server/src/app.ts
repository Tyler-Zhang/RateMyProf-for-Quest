import { useExpressServer, useContainer } from 'routing-controllers';
import * as compression from 'compression';
import * as express from 'express';
import { createConnection, getConnectionOptions } from 'typeorm';
import { Container } from 'typedi';
import * as bodyParser from 'body-parser';
import * as multer from 'multer';
import { log } from './config/logger';

export async function launch() {
  const { DATABASE_URL, PORT } = process.env;
  /**
   * Connect to database
   */
  await createConnection({
    ...(await getConnectionOptions()),
    url: DATABASE_URL
  } as any);

  log.info(`Connected to database`);

  useContainer(Container);

  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  useExpressServer(app, {
    controllers: [__dirname + "/controllers/*.ts"],
    routePrefix: '/api',
    classTransformer: true,
    cors: true,
    middlewares: [
      bodyParser.json(),
    ]
  });

  app.use(compression);
  app.listen(PORT);

  log.info(`Running web app on port ${PORT}`);
}
