import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './sections/Hero'
import About from './sections/About'
import Experience from './sections/Experience'
import Projects from './sections/Projects'
import Research from './sections/Research'
import Skills from './sections/Skills'
import Achievements from './sections/Achievements'
import Blogs from './sections/Blogs'
import Contact from './sections/Contact'
import Footer from './components/Footer'
import PageBackground from './components/PageBackground'
import ActivityTicker from './components/ActivityTicker'
import { ContentProvider } from './context/ContentContext'
import { useContent } from './hooks/useContent'
import { useReveal } from './hooks/useReveal'
import { useSpotlight } from './hooks/useSpotlight'
import { useDocumentMeta } from './hooks/useDocumentMeta'

export default function App() {
  const { content, loading, error } = useContent()

  useDocumentMeta(content)
  useReveal(!loading && !!content)
  useSpotlight(!loading && !!content)

  if (loading) {
    return (
      <div className="boot-screen">
        <span className="boot-dot" aria-hidden="true" />
        Loading
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="boot-screen" style={{ color: 'var(--danger)' }}>
        Couldn’t load portfolio data{error ? `: ${error}` : ''}
      </div>
    )
  }

  return (
    <ContentProvider content={content}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <PageBackground />

      <Navbar content={content} />

      <main id="main">
        <Hero data={content.hero} />
        <ActivityTicker items={content.ticker} />
        <About data={content.about} />
        <Experience data={content.experience} />
        <Projects data={content.projects} />
        <Skills data={content.skills} />
        <Research data={content.research} />
        <Achievements data={content.achievements} />
        <Blogs data={content.blogs} />
        <Contact data={content.contact} />
      </main>

      <Footer content={content} />
    </ContentProvider>
  )
}
