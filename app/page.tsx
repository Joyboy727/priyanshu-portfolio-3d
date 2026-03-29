'use client';

import { useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';

// ============================================================
// CONFIGURATION
// ============================================================
const FRAME_COUNT = 192;        // total WebP frames (000–191)
const FRAME_PATH = '/frames/frame_';  // served from public/frames/
const FRAME_EXT = '.webp';
// Frames named: frame_0001.webp, frame_0002.webp, etc.
// ============================================================

function pad(n: number): string {
  return String(n).padStart(4, '0');
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const framesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef(0);
  const currentFrameRef = useRef(-1);
  const tickingRef = useRef(false);

  // ── RESIZE: 16:9 cover on any screen ──────────────────────
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sw = window.innerWidth;
    const sh = window.innerHeight;
    const sa = sw / sh;
    const fa = 16 / 9;

    if (sa < fa) {
      // Portrait phone — height fills screen, width bleeds
      const w = Math.ceil(sh * fa);
      canvas.width = w;
      canvas.height = sh;
      canvas.style.width = w + 'px';
      canvas.style.height = sh + 'px';
      canvas.style.left = Math.floor((sw - w) / 2) + 'px';
      canvas.style.top = '0px';
    } else {
      // Landscape / desktop — width fills, height centered
      const h = Math.ceil(sw / fa);
      canvas.width = sw;
      canvas.height = h;
      canvas.style.width = sw + 'px';
      canvas.style.height = h + 'px';
      canvas.style.left = '0px';
      canvas.style.top = Math.floor((sh - h) / 2) + 'px';
    }

    // Redraw current frame after resize
    const cf = currentFrameRef.current;
    if (cf >= 0 && framesRef.current[cf]?.complete) {
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(framesRef.current[cf], 0, 0, canvas.width, canvas.height);
    }
  }, []);

  // ── SCROLL SPACER HEIGHT ──────────────────────────────────
  const setSpacerHeight = useCallback(() => {
    const spacer = spacerRef.current;
    if (!spacer) return;
    const isMobile = window.innerWidth < 768;
    const pxPerFrame = isMobile ? 10 : 14;
    spacer.style.height = (FRAME_COUNT * pxPerFrame) + 'px';
  }, []);

  // ── SCROLL → FRAME ENGINE ─────────────────────────────────
  const onScroll = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;

    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const reveal = revealRef.current;
      const hint = hintRef.current;
      if (!canvas) { tickingRef.current = false; return; }

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = Math.min(window.scrollY / maxScroll, 1);
      const index = Math.min(
        Math.floor(fraction * FRAME_COUNT),
        FRAME_COUNT - 1
      );

      // Draw only if frame changed
      if (index !== currentFrameRef.current) {
        currentFrameRef.current = index;
        const img = framesRef.current[index];
        if (img?.complete) {
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      }

      // REVEAL TEXT — triggers at last 4% of scroll
      if (reveal) {
        if (fraction >= 0.96) {
          reveal.classList.add('visible');
        } else {
          reveal.classList.remove('visible');
        }
      }

      // SCROLL HINT — hide after 5% scroll
      if (hint) {
        if (fraction > 0.05) {
          hint.classList.add('hidden');
        } else {
          hint.classList.remove('hidden');
        }
      }

      tickingRef.current = false;
    });
  }, []);

  // ── PRELOAD ALL FRAMES ────────────────────────────────────
  const preload = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      framesRef.current = [];
      loadedRef.current = 0;

      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = FRAME_PATH + pad(i + 1) + FRAME_EXT;

        img.onload = img.onerror = () => {
          loadedRef.current++;
          const pct = Math.floor((loadedRef.current / FRAME_COUNT) * 100);

          if (barRef.current) {
            barRef.current.style.width = pct + '%';
          }
          if (countRef.current) {
            countRef.current.textContent = String(pct).padStart(2, '0');
          }

          if (loadedRef.current === FRAME_COUNT) resolve();
        };

        framesRef.current[i] = img;
      }
    });
  }, []);

  // ── INIT ─────────────────────────────────────────────────
  useEffect(() => {
    resize();
    setSpacerHeight();

    window.addEventListener('resize', resize);
    window.addEventListener('resize', setSpacerHeight);
    window.addEventListener('scroll', onScroll, { passive: true });

    preload().then(() => {
      const canvas = canvasRef.current;
      const loader = loaderRef.current;

      if (canvas && framesRef.current[0]) {
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(framesRef.current[0], 0, 0, canvas.width, canvas.height);
        currentFrameRef.current = 0;
      }

      if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => {
          loader.style.display = 'none';
        }, 800);
      }
    });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', setSpacerHeight);
      window.removeEventListener('scroll', onScroll);
    };
  }, [resize, setSpacerHeight, onScroll, preload]);

  return (
    <>
      {/* 0. NAVBAR */}
      <Navbar />

      {/* 1. THE CANVAS — sequence renders here */}
      <canvas id="seq" ref={canvasRef} />

      {/* 2. LOADING OVERLAY */}
      <div id="loader" ref={loaderRef}>
        <div className="bar-wrap">
          <div className="bar-fill" ref={barRef} />
        </div>
        <div className="count" ref={countRef}>00</div>
      </div>

      {/* 3. SCROLL SPACER — creates scrollable height */}
      <div id="spacer" ref={spacerRef} />

      {/* 4. REVEAL TEXT — fixed, appears at end */}
      <div id="reveal" ref={revealRef}>
        <span className="pre">I AM</span>
        <span className="name">PRIYANSHU</span>
        <span className="tag">WEB DEVELOPER · BUILDER · AI ENTHUSIAST</span>
        <a href="mailto:priyanshuchowdhury38@gmail.com" className="email">priyanshuchowdhury38@gmail.com</a>
      </div>

      {/* 5. SCROLL INDICATOR — visible at start only */}
      <div id="scroll-hint" ref={hintRef}>
        <div className="line" />
        <div className="dot" />
      </div>
    </>
  );
}
