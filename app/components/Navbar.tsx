'use client';

import { useEffect, useRef, useState } from 'react';

const NAV_LINKS = [
  { label: 'About',    href: '#about' },
  { label: 'Work',     href: '#work' },
  { label: 'Skills',   href: '#skills' },
  { label: 'Contact',  href: 'mailto:priyanshuchowdhury38@gmail.com' },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [hidden,    setHidden]    = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      // Auto-hide when scrolling down fast, reveal on scroll up
      setHidden(y > lastScrollY.current + 12 && y > 120);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        id="navbar"
        className={[
          'nav',
          scrolled  ? 'nav--scrolled' : '',
          hidden    ? 'nav--hidden'   : '',
          menuOpen  ? 'nav--open'     : '',
        ].join(' ')}
        aria-label="Main navigation"
      >
        {/* Logo / img */}
        <a href="#" className="nav__logo" aria-label="Priyanshu – home">
          <img src="/logo.png" alt="Priyanshu Logo" className="nav__logo-img" />
        </a>

        {/* Centre links — desktop */}
        <ul className="nav__links" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a href={href} className="nav__link">
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA — desktop */}
        <a href="mailto:priyanshuchowdhury38@gmail.com" className="nav__cta">
          Let&apos;s talk
        </a>

        {/* Hamburger — mobile */}
        <button
          className="nav__burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`nav__drawer ${menuOpen ? 'nav__drawer--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className="nav__drawer-link"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <a href="mailto:priyanshuchowdhury38@gmail.com" className="nav__cta nav__cta--drawer" onClick={() => setMenuOpen(false)}>
          Let&apos;s talk
        </a>
      </div>

      {/* Backdrop for mobile */}
      {menuOpen && (
        <div
          className="nav__backdrop"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
