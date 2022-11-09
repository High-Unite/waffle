import { EnrollmentCycle, HomeschoolHub } from './schema';

export type Email = `${string}@${string}.${string}`;
export type HGHub =
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
export type HGEnrollmentCycle = 'March' | 'June' | 'September' | 'December';
export type FacebookProfile = `https://www.facebook.com/${string}`;
export type InstagramProfile = `https://www.instagram.com/${string}`;

/**
 * @deprecated since Maple Syrup (MongoDB + GraphQL)
 */
export interface Person extends WithId<Document> {
  id: string;
  isEnrolled: boolean;
  verifiedStatus: boolean;
  learnersId: string;
  createdAt: unknown;
  updatedAt: unknown;
  data: {
    nickname: string;
    firstName: string;
    lastName: string;
    fullName: string;
    gender: 'Male' | 'Female';
    birthday: string;
    age: string;
    status: 'Enrollee' | 'Alum';
    learnersId: string;
    grade: string;
    enrollmentCycle: HGEnrollmentCycle;
    hgHub: HGHub;
    batch: string;
    exitYear: string;
    yearsHomeschooled: string;
    huProgramsJoined: string;
    huEventsJoined: string;
    familyBusiness: string;
    familyBusinessClassification: string;
    familyBusinessDescription: string;
    newSchool: string;
    personalEmail: Email;
    personalContact: string;
    address: string;
    facebookProfile: FacebookProfile;
    instagramUsername: string;
    instagramProfile: InstagramProfile;
    parentsEmail: Email;
    parentsContact: string;
    suggestions: string;
    alumniSuggestions: string;
    hobbies: string;
    referral: string;
    dataConsent: 'TRUE' | 'FALSE';
    submittedAt: string;
    lastUpdated: string;
    club: string;
    discordId: string;
    legacyLevel: string;
    legacyHub: string;
    lichessAccount: string;
    sportsfestTeam: string;

    interests: string;
  };
}

/**
 * @deprecated since Databasser (MongoDB)
 */
export interface HUDB2022 {
  'Last name': string;
  'First name': string;
  'Full name': string;
  Nickname: string;
  Gender: 'Male' | 'Female';
  Birthday: string;
  Age: string;
  Status: 'Enrollee' | 'Alum';
  "Learner's ID": string;
  Grade: string;
  'Enrollment cycle': EnrollmentCycle | '';
  'HG hub': HomeschoolHub | '';
  Batch: string;
  'Exit year': string;
  'Years homeschooled': string;
  'HU programs joined': string;
  'HU events joined': string;
  'Family Business': string;
  'Family business classification': string;
  'Family business description': string;
  'New school': string;
  'Personal email': string;
  'Personal contact': string;
  Address: string;
  'Facebook profile': string;
  'Instagram profile': string;
  "Parent's email": string;
  "Parent's contact": string;
  Suggestions: string;
  'Alumni suggestions': string;
  Hobbies: string;
  Referral: string;
  'Data consent': 'TRUE';
  'Submitted at': string;
  'Last updated': string;
  Club: string;
  'Discord ID': string;
  'Legacy level': string;
  'Legacy hub': string;
  'Lichess account': string;
  'Sportsfest Team': string;
}
