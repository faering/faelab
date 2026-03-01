import './env';

import { createServer } from './server/createServer.js';

const app = createServer();

app.listen({ port: 3001, host: '0.0.0.0' }, (err: Error | null) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info('API running on port 3001');
});
