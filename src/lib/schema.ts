import fees from '../data/fees-hours.json';
import { getDialablePhone, siteInfo } from '../config/site';

type WithLogo = {
  logoUrl: string;
};

function toTwentyFourHour(value: string): string {
  const match = value.trim().toLowerCase().match(/^(\d{1,2}):(\d{2})(am|pm)$/);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = match[2];
  const period = match[3];
  let normalized = hour % 12;
  if (period === 'pm') normalized += 12;
  return `${String(normalized).padStart(2, '0')}:${minute}`;
}

function parseHoursRange(hours: string): { opens: string; closes: string } | null {
  const [start, end] = hours.split('-').map((entry) => entry.trim());
  if (!start || !end) return null;
  return {
    opens: toTwentyFourHour(start),
    closes: toTwentyFourHour(end)
  };
}

function buildOpeningHoursSpecification() {
  const uniqueHours = Array.from(new Set(fees.programs.map((program) => program.hours)));
  return uniqueHours
    .map(parseHoursRange)
    .filter((range): range is { opens: string; closes: string } => range !== null)
    .map((range) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday'
      ],
      opens: range.opens,
      closes: range.closes
    }));
}

export function buildSchoolSchema({ logoUrl }: WithLogo) {
  return {
    '@context': 'https://schema.org',
    '@type': ['School', 'EducationalOrganization'],
    name: siteInfo.siteName,
    url: siteInfo.canonicalBaseUrl,
    telephone: getDialablePhone(),
    email: siteInfo.email,
    logo: logoUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteInfo.address.street,
      addressLocality: siteInfo.address.city,
      addressRegion: siteInfo.address.region,
      postalCode: siteInfo.address.postalCode,
      addressCountry: siteInfo.address.country
    },
    openingHoursSpecification: buildOpeningHoursSpecification(),
    areaServed: ['Auburn, AL', 'Opelika, AL']
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteInfo.siteName,
    url: siteInfo.canonicalBaseUrl
  };
}

export function buildFaqSchema(entries: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer
      }
    }))
  };
}
