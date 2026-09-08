/**
 * Helpers for reading the shapes stored in content.json.
 *
 * The admin panel writes experience descriptions as one blob:
 *
 *   <intro paragraph>
 *
 *   <heading, e.g. "Key contributions">
 *
 *   • bullet one
 *
 *   • bullet two
 *
 * These helpers turn that back into structured data so the 3D overlays can
 * render real lists instead of a wall of pre-wrapped text.
 */

const BULLET_RE = /^[•‣◦⁃\-*]\s*/

/** Split an experience description into { intro, heading, bullets }. */
export function parseDescription(description = '') {
  const blocks = String(description)
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)

  const intro = []
  let heading = ''
  const bullets = []

  for (const block of blocks) {
    if (BULLET_RE.test(block)) {
      bullets.push(block.replace(BULLET_RE, '').trim())
    } else if (bullets.length === 0 && block.length < 40 && intro.length > 0) {
      // A short line right before the bullets is the "Key contributions" label.
      heading = block
    } else if (bullets.length === 0) {
      intro.push(block)
    }
  }

  return { intro: intro.join(' '), heading, bullets }
}

/** True when a period string looks like an ongoing role. */
export function isCurrent(period = '') {
  return /present|current|now|ongoing/i.test(period)
}

/** Strip simple inline HTML (content.json bios allow <strong>). */
export function stripTags(html = '') {
  return String(html).replace(/<[^>]*>/g, '')
}
