import 'jake';
import * as seeds from '../seeds';
import { createConnection } from 'typeorm';
import { databaseConfig } from '../config';

namespace('wqp', () => {
  task('seed', { async: true } , async () => {
    const connection = await createConnection(databaseConfig);

    await new seeds.SchoolSeed().run();

    connection.close();
    complete();
  })
})
