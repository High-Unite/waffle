import express from 'express';

// config (import .env file)
import dotenv from 'dotenv';
dotenv.config({ encoding: 'utf8' });
const config = {
  // WEBSERVER CONFIG
  host: process.env.WAFFLE_HTTP_HOST || '0.0.0.0',
  port: process.env.WAFFLE_HTTP_PORT || '5000',
};

const app = express();

// graphql route
import graphqlRoute from './routes/graphql';
app.use(await graphqlRoute());

app.listen(+config.port, config.host, () => {
  const address = config.host == '0.0.0.0' ? 'localhost' : config.host;
  console.log('[express]', `Listening on http://${address}:${config.port}`);
});
