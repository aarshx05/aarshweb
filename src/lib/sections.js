// One list drives the header nav, the Index overlay, scroll-spy and every
// section's numbered label, so they can never drift apart.
export const SECTIONS = [
  { id: 'about', n: '01', label: 'About', nav: true },
  { id: 'experience', n: '02', label: 'Experience', nav: true },
  { id: 'work', n: '03', label: 'Work', nav: true },
  { id: 'research', n: '04', label: 'Research', nav: true },
  { id: 'skills', n: '05', label: 'Skills', nav: false },
  { id: 'recognition', n: '06', label: 'Achievements', nav: false },
  { id: 'writing', n: '07', label: 'Writing', nav: true },
  { id: 'contact', n: '08', label: 'Contact', nav: true },
]

export const sectionOf = (id) => SECTIONS.find((s) => s.id === id)

/** Escape everything except <strong>, which the admin panel allows in bios. */
export function safeInline(html = '') {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;(\/?)strong&gt;/g, '<$1strong>')
}

export function findSocial(contact, re) {
  return (contact?.socials || []).find((s) => re.test(s.name))
}
