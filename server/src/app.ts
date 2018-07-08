import { useExpressServer, useContainer } from 'routing-controllers';
import { get } from 'lodash';
import { join } from 'path';
import * as compression from 'compression';
import * as express from 'express';
import { createConnection } from 'typeorm';
import { Container } from 'typedi';
import * as bodyParser from 'body-parser';
import { log, databaseConfig } from './config';

export async function launch() {
  const port = get(process.env, 'PORT', 8080);
  /**
   * Connect to database
   */
  await createConnection(databaseConfig);

  log.info(`Connected to database`);

  useContainer(Container);

  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  useExpressServer(app, {
    controllers: [join(__dirname, 'controllers', '*.{ts,js}')],
    routePrefix: '/api',
    classTransformer: true,
    cors: true
  });

  app.use(compression);
  app.listen(port);

  log.info(`Running web app on port ${port}`);
}
