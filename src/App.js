import { Fragment } from 'react';
import './App.css';
import Typewriter from './Typewriter';
import Game from './Game';

// ── Config — update these with your details ──────────────────
const config = {
  name: 'Kiano',
  title: '(Julius G.)',
  about:
    "Architecting for reliability, zero-downtime deployments, mobile applications, and infrastructure that powers millions of users.",
  links: [
    { label: 'github', href: 'https://github.com/jgkiano' },
    { label: 'linkedin', href: 'https://www.linkedin.com/in/kiano/' },
    { label: 'email', href: 'mailto:hi@kiano.me' },
  ],
};
// ─────────────────────────────────────────────────────────────

function App() {
  const year = new Date().getFullYear();

return (
    <div className="page">
      <div className="mobile-banner" aria-hidden="true">
        <span className="mobile-banner-accent">✦</span> enhanced experience on desktop
      </div>
      <header className="site-header">
        <nav className="header-links" aria-label="Links">
          {config.links.map(({ label, href }, i) => (
            <Fragment key={label}>
              {i > 0 && <span className="footer-dot" aria-hidden="true" />}
              <a
                className="link"
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              >
                {label}
              </a>
            </Fragment>
          ))}
        </nav>
      </header>
      <main className="main">
        <div className="content">
          <Typewriter />

          <h1 className="name" aria-label={config.name}>
            {config.name.split('').map((char, i) => (
              <span key={i} className="name-char" style={{ '--i': i }}>
                {char}
              </span>
            ))}
          </h1>
          <p className="title">{config.title}</p>
          <p className="tag">Senior Software Engineer</p>

          <div className="divider" aria-hidden="true" />

          <p className="about">{config.about}</p>

          <div className="meta">
            <div className="cta-group">
              <a className="cta" href="https://calendly.com/hi-kiano" target="_blank" rel="noopener noreferrer">
                Schedule a call
              </a>
              <a className="cta cta-ghost" href="mailto:hi@kiano.me">
                hi@kiano.me
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <span className="footer-copy">{year}</span>
      </footer>
      <Game />
    </div>
  );
}

export default App;
