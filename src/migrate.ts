/*

==============================================================
-------------------- ⛔ !! WARNING !! ⛔ --------------------
----- Achtung - Advertencia - Опасность - Peligro - 危険 -----
==============================================================

This script **will** replace data on the target database
Only use this to migrate data and nothing else!

By running this script you agree that you take responsibility
for incurring any data loss, damage, or altercations caused
by code within this script.

If you don't know what you are doing, immediately close this
file and walk away and act like nothing ever happened.

==============================================================

*/

import { readFileSync, writeFileSync } from 'fs';
import cliProgress from 'cli-progress';
import { ObjectId, WithId } from 'mongodb';
import MongoBridge from './utils/mongodb.js';
import { PersonMetadata, Person, Account } from './schema';
import * as OldApi from './oldApiData';

import dotenv from 'dotenv';
dotenv.config({ encoding: 'utf8' });
const {
  WAFFLE_MONGODB_URL = '',
  WAFFLE_MONGODB_DB = '',
  DATABASSER_MONGODB_DB = '',
} = process.env;

// add a progress bar to look like hackerman
const progressBarOptions = {
  opt: {
    format: '[progress] {bar} {percentage}% | ETA: {eta}s | {value}/{total}',
    // hideCursor: true,
    clearOnComplete: true,
    stopOnComplete: true,
    forceRedraw: true,
  },
  preset: cliProgress.Presets.shades_classic,
};

//
// Migrate section
async function movingService<T>(
  migrateFunction: () => Promise<T>,
  metadata: { name: string; convertTo: string }
) {
  console.log(
    `[${metadata.name}]`,
    `Starting data migration: ${metadata.convertTo}`
  );
  const migratedData = await migrateFunction();
  writeFileSync(`./${metadata.name}.out.json`, JSON.stringify(migratedData), {
    encoding: 'utf8',
  });
  console.log(
    `[${metadata.name}]`,
    `Finished data migration: ${metadata.convertTo}`
  );

  return migratedData;
}

interface MigratedData {
  Person: WithId<Person>;
  Account: WithId<Partial<Account>>;
}

async function migrateGoogleSheets(): Promise<MigratedData[]> {
  // setup progress bar
  const progressBar = new cliProgress.SingleBar(
    progressBarOptions.opt,
    progressBarOptions.preset
  );

  const oldJson: OldApi.HUDB2022[] = JSON.parse(
    readFileSync('./HU Database 2021-2022 - Main.json', { encoding: 'utf8' })
  );

  progressBar.start(oldJson.length, 0);

  const newJson = oldJson.map((db) => {
    // mongodb stuff
    const personId = new ObjectId();
    const accountId = new ObjectId();

    // import metadata from google sheets
    const metadata: PersonMetadata = {
      name: db['Full name'], // full name
      nickname: db['Nickname'],
      firstName: db['First name'],
      middleName: null,
      lastName: db['Last name'],
      nameSuffix: null,
      gender: db['Gender'],
      birthday: new Date(db['Birthday']),
      // age: null,
      status: db['Status'] == 'Alum' ? 'Alumni' : 'Enrollee',
      grade: +db['Grade'] || null, // k-12 thing
      enrollmentCycle: db['Enrollment cycle'] || null,
      hgHub: db['HG hub'] || null,
      batch: +db['Batch'] || null,
      address: db['Address'],
      contact: {
        personal: {
          email: db['Personal email'],
          phone: db['Personal contact'],
          social: {
            facebook: db['Facebook profile'],
            instagram: db['Instagram profile'],
          },
        },
        parent: {
          email: db["Parent's email"],
          phone: db["Parent's contact"],
        },
      },
      interests: db['Hobbies'],
      //
      // change this please
      clubs: db['Club']
        ? [...new Set(db['Club'].split(', '))].map((name) => ({
            name,
            id: name.toLowerCase().replace(' ', '-'),
            // url: '',
            // logoUrl: '',
          }))
        : [],
      legacy: db['Legacy level']
        ? {
            level: +db['Legacy level'],
            hub: db['Legacy hub'],
          }
        : false,
      miscData: {},
    };

    const person: WithId<Person> = {
      _id: personId,
      accountId,
      learnersId: db["Learner's ID"],
      metadata,
      socialIntegrations: {},
    };

    const account: WithId<
      Account & { username: undefined; hashword: undefined }
    > = {
      _id: accountId,
      personId,
      learnersId: person.learnersId,
      // the google sheets db doesn't use accounts
      // making it undefined for now... 😥
      username: undefined,
      email: {
        personal: person.metadata.contact.personal.email,
        parent: person.metadata.contact.parent.email,
      },
      hashword: undefined,
    };

    progressBar.increment();
    return {
      Person: person,
      Account: account,
    };
  });

  progressBar.stop();
  return newJson;
}

async function migrateMongoDB(googleSheetsJSONData: MigratedData[]): Promise<{
  missingPeople: WithId<OldApi.Person>[];
  newJson: MigratedData[];
}> {
  // setup progress bar
  const progressBar = new cliProgress.SingleBar(
    progressBarOptions.opt,
    progressBarOptions.preset
  );

  // get everything from mongodb
  const client = new MongoBridge(WAFFLE_MONGODB_URL);
  const db = await client.db(DATABASSER_MONGODB_DB);
  const oldPersonCollection = db.collection<OldApi.Person>('Person');
  const oldUserCollection = db.collection<{
    email: string;
    flags: number;
    name: string;
    parentsEmail: string;
    password: string;
    personId?: ObjectId | null;
    verified: boolean;
  }>('User');
  const oldConnectedAccountCollection = db.collection<
    WithId<{
      accountId: string;
      displayName: string;
      type: 'discord';
      userId: ObjectId;
    }>
  >('ConnectedAccount');

  const findAll = async (Person: WithId<OldApi.Person>) => {
    const User = await oldUserCollection.findOne({ personId: Person._id });
    if (!User) return null;

    const ConnectedAccount = await oldConnectedAccountCollection.findOne({
      userId: User._id,
    });
    if (!ConnectedAccount) return null;

    return {
      Person,
      User,
      ConnectedAccount,
    };
  };

  // all people
  const People = await oldPersonCollection.find({}).toArray();

  const oldJson = People;
  const newJson: MigratedData[] = [];

  console.log('[migrateMongoDB]', 'Received oldJson from DB');

  progressBar.start(oldJson.length, 0);

  const missingPeople: WithId<OldApi.Person>[] = [];
  for (let i = 0; i < oldJson.length; i++) {
    const dbData = oldJson[i];

    const allData = await findAll(dbData);

    function data() {
      if (allData) {
        const { Person, User, ConnectedAccount } = allData;

        // mongodb stuff
        // const personId = new ObjectId();
        // const accountId = new ObjectId();
        const accountId = User._id;

        return <MigratedData>{
          Person: {
            _id: Person._id,
            accountId,
            learnersId: Person.learnersId,
            metadata: {
              name: Person.data.fullName, // full name
              nickname: Person.data.nickname,
              firstName: Person.data.firstName,
              middleName: null,
              lastName: Person.data.lastName,
              nameSuffix: null,
              gender: Person.data.gender,
              birthday: new Date(Person.data.birthday),
              // age: number | null;
              status: Person.data.status == 'Alum' ? 'Alumni' : 'Enrollee',
              grade: +Person.data.grade || null, // k-12 thing
              enrollmentCycle: Person.data.enrollmentCycle || null,
              hgHub: Person.data.hgHub || null,
              batch: +Person.data.batch || null,
              address: Person.data.address,
              contact: {
                personal: {
                  email: Person.data.personalEmail,
                  phone: Person.data.personalContact || '',
                  social: {
                    facebook: Person.data.facebookProfile || '',
                    instagram:
                      Person.data.instagramProfile ||
                      Person.data.instagramUsername ||
                      '',
                  },
                },
                parent: {
                  email: Person.data.parentsEmail || '',
                  phone: Person.data.parentsContact || '',
                },
              },
              interests: Person.data.hobbies,
              clubs: Person.data.club
                ? [...new Set(Person.data.club.split(', '))].map((name) => ({
                    name,
                    id: name.toLowerCase().replace(' ', '-'),
                    // url: '',
                    // logoUrl: '',
                  }))
                : [],
              legacy: Person.data.legacyLevel
                ? {
                    level: +Person.data.legacyLevel,
                    hub: Person.data.legacyHub,
                  }
                : false,
              miscData: {},
            },
            socialIntegrations: {
              discord: ConnectedAccount.accountId,
            },
          },
          Account: {
            _id: accountId,
            personId: Person._id,
            learnersId: Person.learnersId,
            username: User.name,
            email: {
              personal: User.email,
              parent: User.parentsEmail,
            },
            hashword: User.password,
          },
        };
      } else
        return googleSheetsJSONData.find(
          (data) => data.Person.learnersId == dbData.learnersId
        );
    }
    const elGato = data();
    if (elGato) newJson.push(elGato);
    else missingPeople.push(dbData);

    progressBar.increment();
  }

  progressBar.stop();
  console.log(
    '[migrateMongoDB]',
    `Finished soft data handling with ${missingPeople.length} from parsed GSheets JSON data`
  );
  return { missingPeople, newJson };
}

// = STEP 1 =
// migrate GSheets -> JSON
const googleSheetsJSONData = await movingService<MigratedData[]>(
  migrateGoogleSheets,
  { name: 'migrateGoogleSheets', convertTo: 'GSheets -> JSON' }
);

// = STEP 2 =
// migrate Databasser + GSheets -> JSON
const mongoDbJSONData = await movingService<{
  missingPeople: WithId<OldApi.Person>[];
  newJson: MigratedData[];
}>(() => migrateMongoDB(googleSheetsJSONData), {
  name: 'migrateMongoDb',
  convertTo: 'Databasser + GSheets -> JSON',
});

// = STEP 3 (FINAL) =
// migrate JSON -> Maple Syrup DB
async function migrateToDb() {
  // setup progress bar
  const progressBar = new cliProgress.SingleBar(
    progressBarOptions.opt,
    progressBarOptions.preset
  );

  console.log(
    `[mapleSyrupMaker]`,
    `Starting data migration: JSON -> Maple Syrup DB`
  );

  const client = new MongoBridge(WAFFLE_MONGODB_URL);
  const db = await client.db(WAFFLE_MONGODB_DB);

  const pendingData = JSON.parse(
    readFileSync('./migrateMongoDb.out.json', { encoding: 'utf8' })
  ) as {
    missingPeople: WithId<OldApi.Person>[];
    newJson: { Person: Person; Account: Account }[];
  };

  const identityCollection = db.collection<Person>('identity');
  const accountCollection = db.collection<Account>('account');

  progressBar.start(pendingData.newJson.length, 0);

  for (let i = 0; i < pendingData.newJson.length; i++) {
    const { Person, Account } = pendingData.newJson[i];

    await Promise.all([
      identityCollection.insertOne({
        accountId: new ObjectId(Person.accountId),
        learnersId: Person.learnersId,
        metadata: Person.metadata,
        socialIntegrations: Person.socialIntegrations,
      }),
      accountCollection.insertOne({
        personId: new ObjectId(Account.personId),
        learnersId: Account.learnersId,
        username: Account.username,
        email: Account.email,
        hashword: Account.hashword,
      }),
    ]);

    progressBar.increment();
  }

  progressBar.stop();
  console.log(
    `[mapleSyrupMaker]`,
    `Finished data migration: JSON -> Maple Syrup DB`
  );

  return true;
}

console.debug('[debug]', {
  googleSheetsJSONData: !!googleSheetsJSONData,
  mongoDbJSONData: !!mongoDbJSONData,
});

if (await migrateToDb()) {
  console.log('[migrate.ts]', 'Finished migrating data to Maple Syrup DB');

  // if all goes smoothly, exit normally
  process.exit();
} else process.exit(1);
