export const siteInfo = {
  siteName: "Auburn Montessori School - The Children's House",
  canonicalBaseUrl: "https://auburnmontessori.org",
  address: {
    street: "231 E. Drake Ave.",
    city: "Auburn",
    region: "AL",
    postalCode: "36830",
    country: "US"
  },
  phone: "(334) 740-6192",
  email: "amstchori@gmail.com",
  founderDirector: "Charlene Kam"
} as const;

export function getCanonicalUrl(pathname: string): string {
  return new URL(pathname, siteInfo.canonicalBaseUrl).toString();
}

export function getDialablePhone(phone: string = siteInfo.phone): string {
  return `+1${phone.replace(/\D/g, "")}`;
}
