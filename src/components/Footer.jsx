export default function Footer({ content }) {
  const socials = Array.isArray(content?.contact?.socials) ? content.contact.socials : []
  const name = content?.hero?.name || 'Aarsh Chaurasia'

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()} {name}
        </p>

        <div className="footer-links">
          {socials
            .filter((s) => !/email/i.test(s.name))
            .slice(0, 5)
            .map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>
            ))}
        </div>
      </div>
    </footer>
  )
}
