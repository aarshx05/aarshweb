import { TopBar, Dock } from './components/Chrome'
import Footer from './components/Footer'
import Marquee from './components/Marquee'
import Hero from './sections/Hero'
import About from './sections/About'
import Experience from './sections/Experience'
import Projects from './sections/Projects'
import Research from './sections/Research'
import Skills from './sections/Skills'
import Achievements from './sections/Achievements'
import Blogs from './sections/Blogs'
import Contact from './sections/Contact'
import { ContentProvider } from './context/ContentContext'
import { useContent } from './hooks/useContent'
import { useReveal } from './hooks/useReveal'
import { useTheme } from './hooks/useTheme'
import { useActiveSection } from './hooks/useActiveSection'
import { useDocumentMeta } from './hooks/useDocumentMeta'
import { SECTIONS, findSocial } from './lib/sections'

const SECTION_IDS = SECTIONS.map((s) => s.id)

export default function App() {
  const { content, loading, error } = useContent()
  const { theme, toggle } = useTheme()
  const ready = !loading && !!content

  useDocumentMeta(content)
  useReveal(ready)
  const activeId = useActiveSection(SECTION_IDS, ready)

  if (loading) {
    return (
      <div className="boot" role="status">
        loading<span className="dot">.</span>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="boot" role="alert">
        couldn’t load portfolio data{error ? `: ${error}` : ''}
      </div>
    )
  }

  const { hero, about, contact } = content
  const email = findSocial(contact, /email/i)?.handle
  const medium = findSocial(contact, /medium/i)?.href

  return (
    <ContentProvider content={content}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <TopBar name={hero.name} email={email} />

      <main id="main">
        <Hero data={hero} contact={contact} />
        <Marquee items={content.ticker} />
        <About data={about} heroImage={hero.image} name={hero.name} />
        <Experience data={content.experience} />
        <Projects data={content.projects} />
        <Research data={content.research} />
        <Skills data={content.skills} />
        <Achievements data={content.achievements} />
        <Blogs data={content.blogs} mediumHref={medium} />
        <Contact data={contact} />
      </main>

      <Footer content={content} />
      <Dock activeId={activeId} theme={theme} onToggleTheme={toggle} />
    </ContentProvider>
  )
}
