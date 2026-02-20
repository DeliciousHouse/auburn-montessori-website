export type PhotoSource = 'LOCAL_ONLY' | 'BRIGHTWHEEL_EMBED';

const BRIGHTWHEEL_PARENT_SIGN_IN_URL = 'https://schools.mybrightwheel.com/sign-in?redirect';
const BRIGHTWHEEL_STUDENT_REGISTRATION_URL = '';
const BRIGHTWHEEL_PARENT_HANDBOOK_URL = '';
const BRIGHTWHEEL_SCHOOL_CALENDAR_URL = '';
const BRIGHTWHEEL_CONSENT_RELEASE_URL = '';

const PHOTO_SOURCE: PhotoSource = 'LOCAL_ONLY';
const BRIGHTWHEEL_PHOTOS_EMBED_URL = '';

export const siteConfig = {
  brightwheel: {
    parentSignInUrl: BRIGHTWHEEL_PARENT_SIGN_IN_URL,
    studentRegistrationUrl: BRIGHTWHEEL_STUDENT_REGISTRATION_URL,
    parentHandbookUrl: BRIGHTWHEEL_PARENT_HANDBOOK_URL,
    schoolCalendarUrl: BRIGHTWHEEL_SCHOOL_CALENDAR_URL,
    consentReleaseUrl: BRIGHTWHEEL_CONSENT_RELEASE_URL
  },
  photos: {
    source: PHOTO_SOURCE,
    brightwheelEmbedUrl: BRIGHTWHEEL_PHOTOS_EMBED_URL
  }
} as const;

export function hasValue(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
