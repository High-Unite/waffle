import type { WithId, Document } from 'mongodb';

export type EnrollmentCycle = 'March' | 'June' | 'September' | 'December';

export type HomeschoolHub =
  | 'Main (Ortigas)'
  | 'Middle East - Dubai'
  | 'Middle East - Abu Dhabi'
  | 'Middle East - Qatar'
  | 'Middle East - Kingdom of Saudi Arabia'
  | 'United Kingdom'
  | 'Alabang'
  | 'Bacolod'
  | 'Baguio'
  | 'Batangas'
  | 'Cebu'
  | 'Davao'
  | 'General Santos'
  | 'Imus'
  | 'Palawan'
  | 'Qatar'
  | 'Roces';

export interface Club {
  name: string;
  id?: string;
}

// Club for GraphQL
export interface RClub {
  id?: any; // to be discussed
  name: string;
  // url: string;
  // logoUrl: string;
}

export interface LegacyData {
  level: number;
  hub: 'Main' | string;
}

export interface ContactData {
  phone: string;
  email: string;
}

export interface ContactDataPersonal extends ContactData {
  social: {
    facebook: string;
    instagram: string;
  };
}

export interface PersonMetadata {
  name: string; // full name
  nickname: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  nameSuffix: string | null;
  gender: 'Male' | 'Female';
  birthday: Date;
  // age: number | null;
  status: 'Enrollee' | 'Alumni';
  grade: number | null; // k-12 thing
  enrollmentCycle: EnrollmentCycle | null;
  hgHub: HomeschoolHub | null;
  batch: number | null;
  address: string;
  contact: {
    personal: ContactDataPersonal;
    parent: ContactData;
  };
  interests: string;
  clubs: Club[];
  legacy: LegacyData | false;
  miscData: { [index: string]: any };
}

// PersonMetadata for GraphQL
export interface RPersonMetadata extends PersonMetadata {
  birthday: any;
  age: number;
  clubs: RClub[];
}

// include  extends WithId<Document>
export interface Person {
  accountId: ObjectId;
  learnersId: string;
  metadata: PersonMetadata;
  socialIntegrations: {
    discord?: string;
  };
}

// Person for GraphQL
export interface RPerson extends Person {
  metadata: RPersonMetadata;
}

// include  extends WithId<Document>
export interface Account {
  personId: ObjectId;
  learnersId: string;
  username?: string;
  email: {
    personal: string;
    parent: string | null;
  };
  hashword?: string;
}

export interface RawData {
  Person: Person;
  Account: Account;
}
