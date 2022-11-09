import { Router } from 'express';
const route = Router();

import dotenv from 'dotenv';
dotenv.config({ encoding: 'utf8' });
const { WAFFLE_MONGODB_URL = '', WAFFLE_MONGODB_DB = '' } = process.env;

// import graphql
import { graphqlHTTP } from 'express-graphql';
import graphql from 'graphql';

// import utils
import { readFileSync } from 'fs';
import MongoBridge from '../utils/mongodb';
import { ObjectId, WithId } from 'mongodb';
import { Account, Person, RPerson } from '../schema';

// setup database
const database = await new MongoBridge(WAFFLE_MONGODB_URL).db(
  WAFFLE_MONGODB_DB
);

export default async function routeWrapper() {
  const QuerySchema = readFileSync('./schema/graphql/Query.gql', {
    encoding: 'utf8',
  });
  const exampleSchema = graphql.buildSchema(QuerySchema);

  // query handlers
  const PersonQuery = async (query: {
    id: ObjectId;
    accountId: ObjectId;
    learnersId: string;
  }): Promise<RPerson | undefined> => {
    // get Person from ID
    const collection = database.collection<Person>('identity');
    const personData = await collection.findOne(query);

    const getAge = (birthday: Date) => {
      const tNow = new Date().getTime(),
        tBirthday = birthday.getTime();
      const yBirthday = new Date(tNow - tBirthday).getFullYear(),
        yEpoch = new Date(0).getFullYear();
      const age = yBirthday - yEpoch;
      return age;
    };

    // i love guard clauses
    if (!personData) return undefined;
    const output: RPerson = {
      accountId: personData.accountId,
      learnersId: personData.learnersId,
      metadata: {
        ...personData.metadata,
        age: getAge(new Date(personData.metadata.birthday)),
        interests: personData.metadata.interests || '',
        legacy: personData.metadata.legacy || false,
        miscData: personData.metadata.miscData,
      },
      socialIntegrations: personData.socialIntegrations,
    };
    return output;
  };

  const AccountQuery = async (query: {
    id: ObjectId;
    personId: ObjectId;
    learnersId: string;
    username: string;
    personalEmail: string;
    parentsEmail: string;
  }): Promise<Account | undefined> => {
    // get Person from ID
    const collection = database.collection<Account>('account');

    const dbQuery: Partial<WithId<Account & { email: any }>> = { email: {} };
    if (query.id) dbQuery._id = query.id;
    if (query.personId) dbQuery.personId = query.personId;
    if (query.learnersId) dbQuery.learnersId = query.learnersId;
    if (query.username) dbQuery.username = query.username;
    if (query.personalEmail) dbQuery.email.personal = query.personalEmail;
    if (query.parentsEmail) dbQuery.email.parent = query.parentsEmail;
    if (!Object.keys(dbQuery.email).length) delete dbQuery.email;

    const accountData = await collection.findOne(dbQuery);

    // i love guard clauses
    if (!accountData) return undefined;
    const output: Account = {
      personId: accountData.personId,
      learnersId: accountData.learnersId,
      username: accountData.username,
      email: accountData.email,
      hashword: accountData.hashword,
    };
    return output;
  };

  route.use(
    '/graphql',
    graphqlHTTP({
      schema: exampleSchema,
      rootValue: { Person: PersonQuery, Account: AccountQuery },
      graphiql: true,
    })
  );

  // eof
  return route;
}
