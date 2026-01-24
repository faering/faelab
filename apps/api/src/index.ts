import { buildServer } from './server';

const app = buildServer();

app.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info('API running on port 3001');
});
