import express from 'express';

// config
const config = {
  port: 8528,
  address: '0.0.0.0',
};

const app = express();

// import middlewares
import { graphqlHTTP } from 'express-graphql';
import graphql from 'graphql';

const exampleSchema = graphql.buildSchema(`
type Query {
  hello: String
}
`);

app.use(
  '/graphql',
  graphqlHTTP({
    schema: exampleSchema,
    rootValue: {
      hello: () => {
        return 'Hello world!';
      },
    },
    graphiql: true,
  })
);

app.listen(config.port, config.address, () => {
  console.log(
    '[express]',
    `Listening on http://${config.address}:${config.port}`
  );
});
