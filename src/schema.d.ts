type EnrollmentCycle = 'March' | 'June' | 'September' | 'December';

type HomeschoolHub =
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

interface Club {
  name: string;
  url: string;
  logoUrl: string;
}

interface LegacyData {
  level: number;
  hub: 'Main';
}

interface ContactData {
  phone: string;
  email: string;
  social: {
    facebook: string;
    instagram: string;
  };
}

interface PersonMetadata {
  name: string; // full name
  nickname: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  nameSuffix: string;
  gender: 'Male' | 'Female';
  birthday: Date;
  age: number;
  status: 'Enrollee' | 'Alumni';
  grade?: number; // k-12 thing
  enrollmentCycle?: EnrollmentCycle;
  hgHub?: HomeschoolHub;
  batch: number;
  address: string;
  contact: {
    personal: Partial<ContactData>;
    parent?: Partial<ContactData>;
  };
  interests: string;
  clubs: Club[];
  legacy?: LegacyData;
  miscData: { [index: string]: any };
}

interface Person extends WithId<Document> {
  _id: ObjectId;
  accountId: ObjectId;
  learnersId: string;
  metadata: PersonMetadata;
  socialIntegrations: {
    discord?: string;
  };
}
