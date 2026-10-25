// Links built from the contact facts (Sanity `settings`), so tel:, wa.me and Instagram
// URLs live in one place. Pure, usable on the server and the client.
type Contacts = {
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
};

export function contactHrefs(s: Contacts) {
  return {
    tel: `tel:${s.phone.replace(/\s/g, "")}`,
    email: `mailto:${s.email}`,
    whatsapp: `https://wa.me/${s.whatsapp.replace(/\D/g, "")}`,
    instagram: `https://instagram.com/${s.instagram.replace(/^@/, "")}`,
  };
}
