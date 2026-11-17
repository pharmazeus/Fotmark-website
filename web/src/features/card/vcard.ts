import { contactHrefs } from "@/lib/contact";

// Owner's request (2026-11-17): the card names the region only ("Costa del Sol"), the last
// part of the Sanity location "Málaga · Costa del Sol". Without a "·" the whole value stays.
export function cardRegion(location: string) {
  return location.split("·").at(-1)?.trim() ?? "";
}

type Input = {
  name: string;
  note: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  website: string;
};

// RFC 6350 §3.4 text escaping: backslash first, then , ; and newlines.
function escape(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

// vCard 3.0: the version iOS Contacts and Android import most reliably. A company card
// (X-ABShowAs), because the business card page shows the brand, not the founder.
export function buildVCard(input: Input) {
  const href = contactHrefs(input);
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escape(input.name)};;;;`,
    `FN:${escape(input.name)}`,
    `ORG:${escape(input.name)}`,
    "X-ABShowAs:COMPANY",
    `TEL;TYPE=CELL,VOICE:${href.tel.replace(/^tel:/, "")}`,
    `EMAIL;TYPE=INTERNET:${input.email}`,
    `URL:${input.website}`,
    `X-SOCIALPROFILE;TYPE=instagram:${href.instagram}`,
    `NOTE:${escape(input.note)}`,
    "END:VCARD",
  ];
  return `${lines.join("\r\n")}\r\n`;
}
