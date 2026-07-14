"use client";

// Ported from the original worldasaparent-2 site (Next.js), preserving the
// exact design, animation, and layout — but every piece of copy and every
// image now comes from Sanity via props (see src/pages/index.astro) instead
// of hardcoded constants, so a client can edit it without touching code.
//
// The only real content-model difference from the original: per-section
// hand-placed photo positions are design, not content, so they stay hardcoded
// here — matched to the correct Sanity-uploaded image by its original
// filename (preserved on the Sanity asset) rather than by array order, since
// an editor could reorder images in the Studio.

import { useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUp, Play, Menu } from 'lucide-react';
import { useIsMobile } from './useIsMobile';

// ---------------------------------------------------------------------------
// Props (already resolved to plain URLs server-side — see index.astro)
// ---------------------------------------------------------------------------

export interface ImageProp {
  url: string;
  alt: string;
  filename?: string;
}

interface VideoProp {
  thumbnail: ImageProp;
  embedUrl: string;
}

interface ExcerptProp {
  title: string;
  body: string;
}

export interface AppProps {
  hero: {
    title: string;
    byline?: string;
    images: ImageProp[];
  };
  writingSample: {
    heading: string;
    intro?: string;
    bandImages: ImageProp[];
    excerpts: ExcerptProp[];
  };
  letterOfEndorsement: {
    heading: string;
    intro?: string;
    letterImage?: ImageProp;
    letterPdfUrl?: string;
  };
  homescape: {
    heading: string;
    projectTitle: string;
    externalUrl?: string;
    description?: string;
    presentations: string[];
    posterImage?: ImageProp;
    logoImage?: ImageProp;
    backgroundVideoUrl?: string;
    featuredIn: ImageProp[];
    galleryImages: ImageProp[];
    videos: VideoProp[];
  };
  creativeExperience: {
    heading: string;
    portfolioSnapshot?: ImageProp;
    portfolioUrl?: string;
    description?: string;
    cvFileUrl?: string;
  };
}

const BLUE = '#0034E0';
const BRAND = "'General Sans', system-ui, sans-serif";
const SERIF = "'EB Garamond', serif";
const BODY = "'Inter', system-ui, sans-serif";

// ---------------------------------------------------------------------------
// Hand-placed photo positions (design, not content) — matched by the
// original filename Sanity preserves on each uploaded image asset.
// ---------------------------------------------------------------------------

interface PhotoSlot {
  factor: number;
  revealDelay?: number;
  desktop: { left: string; top: string; width: string; aspectRatio: string };
  mobile: { left: string; top: string; width: string; aspectRatio: string };
}

const HERO_POSITIONS: Record<string, PhotoSlot> = {
  'e8c226f0ce4ebb0e326ec38a4dee81fc142a5589.png': {
    factor: 0.1,
    revealDelay: 0.55,
    desktop: { left: '5.3%', top: 'calc(42% + 6rem)', width: '17%', aspectRatio: '328/429' },
    mobile: { left: '2%', top: '67%', width: '30%', aspectRatio: '328/429' },
  },
  'b4eebfce99f050ddf2605bf673f8616ed04b7ca6.png': {
    factor: 0.15,
    revealDelay: 0.67,
    desktop: { left: '39%', top: 'calc(50% + 6rem)', width: '30%', aspectRatio: '589/298' },
    mobile: { left: '34%', top: '75%', width: '30%', aspectRatio: '589/298' },
  },
  '122608485635e846f39d10ad2694f59023f909dd.png': {
    factor: 0.08,
    revealDelay: 0.79,
    desktop: { left: '72%', top: 'calc(40% + 6rem)', width: '18%', aspectRatio: '347/508' },
    mobile: { left: '62%', top: '58%', width: '30%', aspectRatio: '347/508' },
  },
  '833d158ae763c459812b242f17917a96b903e1d7.png': {
    factor: 0.18,
    revealDelay: 0.91,
    desktop: { left: '28%', top: 'calc(63% + 6rem)', width: '14.5%', aspectRatio: '276/422' },
    mobile: { left: '16%', top: '84%', width: '30%', aspectRatio: '276/422' },
  },
  'c9d9ead4369bdec13806dd655ba00bba73b6deb6.png': {
    factor: 0.13,
    revealDelay: 1.03,
    desktop: { left: '50%', top: 'calc(78% + 6rem)', width: '22.5%', aspectRatio: '434/230' },
    mobile: { left: '44%', top: '92%', width: '30%', aspectRatio: '434/230' },
  },
};

const WRITING_SAMPLE_POSITIONS: Record<string, PhotoSlot> = {
  '7500cd3cadaacce24f3eb950d585efc0e01c6e5d.png': {
    factor: 0.14,
    desktop: { left: '7%', top: '34%', width: '15%', aspectRatio: '898/1260' },
    mobile: { left: '5%', top: '2%', width: '30%', aspectRatio: '898/1260' },
  },
  '87ebe7e7d714c3c7b3bdeb076940292155a70ca7.png': {
    factor: 0.18,
    desktop: { left: '74%', top: '44%', width: '15%', aspectRatio: '359/269' },
    mobile: { left: '60%', top: '25%', width: '30%', aspectRatio: '359/269' },
  },
  'eb6add21a75ba300f515952b4877c3540c34ec6e.png': {
    factor: 0.05,
    desktop: { left: '40%', top: '50%', width: '20%', aspectRatio: '718/409' },
    mobile: { left: '35%', top: '47%', width: '30%', aspectRatio: '718/409' },
  },
};

// A fallback slot for any image an editor adds beyond the five/three the
// original design hand-placed — keeps the page from breaking rather than
// trying to guess a bespoke position for content that didn't exist yet.
const FALLBACK_SLOT: PhotoSlot = {
  factor: 0.12,
  desktop: { left: '42%', top: '40%', width: '20%', aspectRatio: '4/3' },
  mobile: { left: '35%', top: '40%', width: '30%', aspectRatio: '4/3' },
};

// ---------------------------------------------------------------------------
// reusable animation wrapper
// ---------------------------------------------------------------------------

const fadeUpVariant = {
  hidden: { opacity: 0, filter: 'blur(10px)', y: 24 },
  visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
};

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// buttons
// ---------------------------------------------------------------------------

function PrimaryButton({
  children,
  href,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const base =
    'group inline-flex items-center justify-center px-6 py-2.5 rounded-full cursor-pointer select-none ' +
    'border-2 border-[#0034E0] bg-[#0034E0] text-white ' +
    'hover:bg-transparent hover:text-[#0034E0]';
  const textStyle: React.CSSProperties = {
    fontFamily: BRAND,
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base} style={textStyle}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={base} style={textStyle}>
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  href,
  onClick,
  light = false,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  light?: boolean;
}) {
  const base =
    'group inline-flex items-center justify-center px-6 py-2.5 rounded-full cursor-pointer select-none border-2 bg-transparent ' +
    (light
      ? 'border-white text-white hover:bg-white hover:text-black'
      : 'border-[#0034E0] text-[#0034E0] hover:bg-[#0034E0] hover:text-white');
  const textStyle: React.CSSProperties = {
    fontFamily: BRAND,
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base} style={textStyle}>
        {children}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={base} style={textStyle}>
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// parallax image
// ---------------------------------------------------------------------------

function ParallaxImage({
  src,
  alt,
  scrollY,
  factor = 0.12,
  className = '',
  imgClassName = '',
  style,
  reveal = false,
  revealDelay = 0,
}: {
  src: string;
  alt: string;
  scrollY: number;
  factor?: number;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  reveal?: boolean;
  revealDelay?: number;
}) {
  const offset = -scrollY * factor;

  const revealProps = reveal
    ? {
        initial: { opacity: 0, scale: 0.94, filter: 'blur(6px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        transition: { duration: 0.95, delay: revealDelay, ease: [0.22, 1, 0.36, 1] as const },
      }
    : {};

  return (
    <motion.div className={className} style={{ ...style, y: offset, willChange: 'transform' }} {...revealProps}>
      <img src={src} alt={alt} className={`w-full h-full object-cover pointer-events-none ${imgClassName}`} />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// lightbox
// ---------------------------------------------------------------------------

type MediaItem = { src: string; alt: string; videoEmbedSrc?: string };

function Lightbox({
  images,
  startIndex,
  open,
  onClose,
}: {
  images: MediaItem[];
  startIndex: number;
  open: boolean;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    setIdx(startIndex);
  }, [startIndex, open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIdx((i) => (i - 1 + images.length) % images.length);
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, images.length, onClose]);

  const current = images[idx];

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <X size={32} />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl font-light z-10 select-none"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                onClick={() => setIdx((i) => (i + 1) % images.length)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-4xl font-light z-10 select-none"
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}
          {current?.videoEmbedSrc ? (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-[90vw] max-w-[1100px] aspect-video rounded-lg overflow-hidden shadow-2xl bg-black"
            >
              <iframe
                className="w-full h-full"
                src={`${current.videoEmbedSrc}?autoplay=true`}
                title={current.alt}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          ) : (
            <motion.img
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={current?.src}
              alt={current?.alt ?? ''}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------------------------------------------------------------------------
// NAVBAR — anchor-scroll within this single-page site, not real routing, so
// labels are fixed to this page's fixed section order rather than editable.
// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { label: 'Writing Sample', id: 'writing-sample' },
  { label: 'Letter of Endorsement', id: 'letter-of-endorsement' },
  { label: 'Creative Background', id: 'homescape' },
  { label: 'CV & Links', id: 'creative-experience' },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-40 hidden md:flex justify-center pt-10 pb-4 pointer-events-none"
      >
        <div
          className="flex gap-16 pointer-events-auto"
          style={{ fontFamily: BRAND, fontWeight: 500, fontSize: '1.1rem', color: BLUE }}
        >
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>
      </motion.nav>

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 right-0 z-50 flex md:hidden pt-6 pr-6"
      >
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-white shadow-md cursor-pointer"
          style={{ color: BLUE }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 md:hidden bg-white flex flex-col items-center justify-center gap-8"
          >
            {NAV_LINKS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-center px-8"
                style={{ fontFamily: BRAND, fontWeight: 500, fontSize: '1.4rem', color: BLUE }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// HERO SECTION
// ---------------------------------------------------------------------------

function HeroSection({ hero, scrollY }: { hero: AppProps['hero']; scrollY: number }) {
  const isMobile = useIsMobile();

  const photos = hero.images.map((img) => ({
    img,
    slot: (img.filename && HERO_POSITIONS[img.filename]) || FALLBACK_SLOT,
  }));

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-x-clip bg-white"
      style={{ minHeight: '100svh' }}
    >
      {photos.map(({ img, slot }, i) => (
        <ParallaxImage
          key={i}
          src={img.url}
          alt={img.alt}
          scrollY={scrollY}
          factor={slot.factor}
          reveal
          revealDelay={slot.revealDelay ?? i * 0.12}
          className="absolute rounded-sm shadow-sm"
          style={isMobile ? slot.mobile : slot.desktop}
        />
      ))}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
        <motion.h1
          initial={{ opacity: 0, filter: 'blur(6px)', scale: 0.96 }}
          animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
          transition={{ duration: 0.95, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: BRAND,
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            color: BLUE,
            lineHeight: 0.9,
            letterSpacing: '-0.01em',
          }}
        >
          {hero.title}
        </motion.h1>
        {hero.byline && (
          <motion.p
            initial={{ opacity: 0, filter: 'blur(6px)', scale: 0.96 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ duration: 0.95, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontSize: 'clamp(1.2rem, 2.4vw, 2rem)',
              color: BLUE,
              lineHeight: 0.9,
              marginTop: '1.2rem',
            }}
          >
            {hero.byline}
          </motion.p>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// WRITING SAMPLE SECTION
// ---------------------------------------------------------------------------

function WritingSampleSection({
  writingSample,
  scrollY,
}: {
  writingSample: AppProps['writingSample'];
  scrollY: number;
}) {
  const isMobile = useIsMobile();

  const bandPhotos = writingSample.bandImages.map((img) => ({
    img,
    slot: (img.filename && WRITING_SAMPLE_POSITIONS[img.filename]) || FALLBACK_SLOT,
  }));

  return (
    <section id="writing-sample" className="bg-white pt-0">
      <div className="relative h-80 md:h-[30rem] w-full">
        {bandPhotos.map(({ img, slot }, i) => (
          <ParallaxImage
            key={i}
            src={img.url}
            alt={img.alt}
            scrollY={scrollY}
            factor={slot.factor}
            className="absolute"
            style={isMobile ? slot.mobile : slot.desktop}
          />
        ))}
      </div>

      <div className="max-w-[1200px] mx-auto px-8 md:px-16 pt-16 pb-12">
        <FadeUp>
          <h2
            style={{
              fontFamily: BRAND,
              fontWeight: 600,
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: BLUE,
              lineHeight: 1.2,
              marginBottom: '1.25rem',
            }}
          >
            {writingSample.heading}
          </h2>
          {writingSample.intro && (
            <p
              style={{
                fontFamily: BODY,
                fontSize: 'clamp(0.95rem, 1.4vw, 1.25rem)',
                color: BLUE,
                lineHeight: 1.5,
                maxWidth: '900px',
              }}
            >
              {writingSample.intro}
            </p>
          )}
        </FadeUp>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 md:px-16 pb-28 flex flex-col gap-20">
        {writingSample.excerpts.map((ex, i) => (
          <FadeUp key={i} delay={i * 0.08}>
            <p style={{ fontFamily: BODY, fontWeight: 600, color: BLUE, marginBottom: '1rem' }}>{ex.title}</p>
            {/* CSS columns let the text flow and balance naturally across two
                columns, rather than needing a hand-maintained split point. */}
            <div
              className="columns-1 md:columns-2 gap-10"
              style={{ fontFamily: BODY, fontSize: 'clamp(0.85rem, 1.1vw, 1rem)', color: BLUE, lineHeight: 1.6 }}
            >
              {ex.body.split('\n\n').map((p, j) => (
                <p key={j} style={{ marginBottom: '1rem', breakInside: 'avoid' }}>
                  {p}
                </p>
              ))}
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// LETTER OF ENDORSEMENT SECTION
// ---------------------------------------------------------------------------

function LetterOfEndorsementSection({
  letterOfEndorsement,
}: {
  letterOfEndorsement: AppProps['letterOfEndorsement'];
}) {
  const { heading, intro, letterImage, letterPdfUrl } = letterOfEndorsement;

  const image = letterImage && (
    <div
      className="relative overflow-hidden rounded-sm"
      style={{ width: 'min(520px, 80vw)', boxShadow: '0 0 50px rgba(0,0,0,0.18), 0 0 0 6px #000' }}
    >
      <img src={letterImage.url} alt={letterImage.alt} className="w-full h-auto block" />
    </div>
  );

  return (
    <section id="letter-of-endorsement" className="bg-white py-24">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16">
        <FadeUp>
          <h2
            style={{
              fontFamily: BRAND,
              fontWeight: 600,
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: BLUE,
              lineHeight: 1.2,
              marginBottom: '1.25rem',
            }}
          >
            {heading}
          </h2>
          {intro && (
            <p
              style={{
                fontFamily: BODY,
                fontSize: 'clamp(0.95rem, 1.4vw, 1.25rem)',
                color: BLUE,
                lineHeight: 1.5,
                maxWidth: '860px',
                marginBottom: '4rem',
              }}
            >
              {intro}
            </p>
          )}
        </FadeUp>

        {image && (
          <FadeUp className="flex justify-center">
            {letterPdfUrl ? (
              <a href={letterPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                {image}
              </a>
            ) : (
              image
            )}
          </FadeUp>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// HOMESCAPE SECTION
// ---------------------------------------------------------------------------

function HomescapeSection({ homescape, scrollY }: { homescape: AppProps['homescape']; scrollY: number }) {
  const {
    heading,
    projectTitle,
    externalUrl,
    description,
    presentations,
    posterImage,
    logoImage,
    backgroundVideoUrl,
    featuredIn,
    galleryImages,
    videos,
  } = homescape;

  const galleryMedia: MediaItem[] = [
    ...galleryImages.map((img) => ({ src: img.url, alt: img.alt })),
    ...videos.map((v) => ({ src: v.thumbnail.url, alt: v.thumbnail.alt, videoEmbedSrc: v.embedUrl })),
  ];
  const VIDEO_START = galleryImages.length;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const openLightbox = useCallback((idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  }, []);

  const posterRef = useRef<HTMLDivElement>(null);
  const [logoOpacity, setLogoOpacity] = useState(1);

  useEffect(() => {
    const el = posterRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const progress = Math.min(Math.max(-rect.top / (rect.height * 0.5), 0), 1);
    setLogoOpacity(1 - progress);
  }, [scrollY]);

  return (
    <section id="homescape" className="bg-black text-white relative overflow-hidden">
      <div ref={posterRef} className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {backgroundVideoUrl ? (
          <video
            className="absolute inset-0 w-full h-full object-cover object-center"
            src={backgroundVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        ) : (
          posterImage && (
            <>
              <img
                src={posterImage.url}
                alt={posterImage.alt}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {logoImage && externalUrl && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                    style={{ width: 'min(620px, 80vw)', opacity: logoOpacity }}
                  >
                    <img src={logoImage.url} alt={logoImage.alt} className="w-full h-auto" />
                  </a>
                </div>
              )}
            </>
          )
        )}
      </div>

      <div className="max-w-[1200px] mx-auto px-8 md:px-16 pt-8 pb-20 md:pt-20">
        <FadeUp>
          <h2
            style={{
              fontFamily: BRAND,
              fontWeight: 600,
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: 'white',
              lineHeight: 1.2,
              marginBottom: '3rem',
            }}
          >
            {heading}
          </h2>
        </FadeUp>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-3">
            <FadeUp>
              {externalUrl ? (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:opacity-75 transition-opacity"
                >
                  <h3
                    style={{
                      fontFamily: BRAND,
                      fontWeight: 600,
                      fontSize: 'clamp(1.3rem, 2.2vw, 1.9rem)',
                      color: 'white',
                      lineHeight: 1.4,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {projectTitle}
                  </h3>
                </a>
              ) : (
                <h3
                  style={{
                    fontFamily: BRAND,
                    fontWeight: 600,
                    fontSize: 'clamp(1.3rem, 2.2vw, 1.9rem)',
                    color: 'white',
                    lineHeight: 1.4,
                    marginBottom: '1.25rem',
                  }}
                >
                  {projectTitle}
                </h3>
              )}
              {description &&
                description.split('\n\n').map((p, j) => (
                  <p
                    key={j}
                    style={{
                      fontFamily: BODY,
                      fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)',
                      color: 'white',
                      lineHeight: 1.6,
                      marginBottom: '1.25rem',
                    }}
                  >
                    {p}
                  </p>
                ))}
              {externalUrl && (
                <SecondaryButton href={externalUrl} light>
                  More Info
                </SecondaryButton>
              )}
            </FadeUp>
          </div>

          {featuredIn.length > 0 && (
            <div className="lg:col-span-2">
              <FadeUp delay={0.15}>
                <p
                  style={{
                    fontFamily: BRAND,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: 'white',
                    marginBottom: '1.5rem',
                  }}
                >
                  Featured in
                </p>
                <div className="flex flex-col items-center gap-6">
                  {featuredIn.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={img.alt}
                      className="w-full max-w-[200px] object-contain opacity-90"
                    />
                  ))}
                </div>
              </FadeUp>
            </div>
          )}
        </div>

        {galleryImages.length > 0 && (
          <FadeUp className="mt-16">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div
                className="col-span-2 row-span-2 overflow-hidden rounded-sm cursor-pointer"
                onClick={() => openLightbox(0)}
              >
                <img
                  src={galleryImages[0].url}
                  alt={galleryImages[0].alt}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              {galleryImages.slice(1).map((img, i) => {
                const idx = i + 1;
                return (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-sm cursor-pointer group/tile"
                    style={{ aspectRatio: '424/255' }}
                    onClick={() => openLightbox(idx)}
                  >
                    <img
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/tile:scale-105"
                    />
                  </div>
                );
              })}
            </div>
          </FadeUp>
        )}

        {videos.length > 0 && (
          <FadeUp className="mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videos.map((v, i) => {
                const idx = i + VIDEO_START;
                return (
                  <div
                    key={idx}
                    className="relative overflow-hidden rounded-sm cursor-pointer group/tile"
                    style={{ aspectRatio: '16/9' }}
                    onClick={() => openLightbox(idx)}
                  >
                    <img
                      src={v.thumbnail.url}
                      alt={v.thumbnail.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/tile:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover/tile:bg-black/40">
                      <span className="flex items-center justify-center w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm">
                        <Play size={26} className="text-white translate-x-[2px]" fill="white" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeUp>
        )}

        {presentations.length > 0 && (
          <FadeUp className="mt-20">
            <h3
              style={{
                fontFamily: BRAND,
                fontWeight: 600,
                fontSize: 'clamp(1.2rem, 2vw, 1.75rem)',
                color: 'white',
                marginBottom: '1.5rem',
              }}
            >
              Notable Presentations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
              {presentations.map((item, i) => (
                <p key={i} style={{ fontFamily: BODY, fontSize: 'clamp(0.85rem, 1.1vw, 1rem)', color: 'white', lineHeight: 1.5 }}>
                  {item}
                </p>
              ))}
            </div>
          </FadeUp>
        )}
      </div>

      <Lightbox images={galleryMedia} startIndex={lightboxIdx} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
    </section>
  );
}

// ---------------------------------------------------------------------------
// CREATIVE PROFESSIONAL EXPERIENCE + FOOTER
// ---------------------------------------------------------------------------

function CreativeExperienceSection({
  creativeExperience,
  heroTitle,
  heroByline,
}: {
  creativeExperience: AppProps['creativeExperience'];
  heroTitle: string;
  heroByline?: string;
}) {
  const { heading, portfolioSnapshot, portfolioUrl, description, cvFileUrl } = creativeExperience;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="creative-experience" className="bg-white">
      <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-24">
        <FadeUp>
          <h2
            style={{
              fontFamily: BRAND,
              fontWeight: 600,
              fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
              color: BLUE,
              lineHeight: 1.2,
              marginBottom: '3rem',
            }}
          >
            {heading}
          </h2>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {portfolioSnapshot && (
            <FadeUp delay={0.1}>
              {portfolioUrl ? (
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-[40px] shadow-sm"
                  aria-label="Visit portfolio"
                >
                  <img
                    src={portfolioSnapshot.url}
                    alt={portfolioSnapshot.alt}
                    className="w-full h-auto object-cover rounded-[40px] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </a>
              ) : (
                <img
                  src={portfolioSnapshot.url}
                  alt={portfolioSnapshot.alt}
                  className="w-full h-auto object-cover rounded-[40px]"
                />
              )}
            </FadeUp>
          )}

          <FadeUp delay={0.2} className="flex flex-col justify-center gap-10">
            {description && (
              <p style={{ fontFamily: BODY, fontSize: 'clamp(0.95rem, 1.3vw, 1.15rem)', color: BLUE, lineHeight: 1.6 }}>
                {description}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              {portfolioUrl && <PrimaryButton href={portfolioUrl}>Visit My Website</PrimaryButton>}
              {cvFileUrl && <SecondaryButton href={cvFileUrl}>Download CV</SecondaryButton>}
            </div>
          </FadeUp>
        </div>
      </div>

      <div className="border-t border-[#0034E0]/10 py-24 text-center">
        <FadeUp>
          <h2 style={{ fontFamily: BRAND, fontWeight: 600, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: BLUE, marginBottom: '4rem' }}>
            Thank you for your time!
          </h2>

          <div
            style={{
              fontFamily: BRAND,
              fontWeight: 700,
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              color: BLUE,
              lineHeight: 0.9,
              marginBottom: '0.6rem',
            }}
          >
            {heroTitle}
          </div>
          {heroByline && (
            <div
              style={{
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontSize: 'clamp(1rem, 2vw, 1.6rem)',
                color: BLUE,
                lineHeight: 0.9,
                marginBottom: '2.5rem',
              }}
            >
              {heroByline}
            </div>
          )}

          <div className="flex justify-center mt-2">
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="group inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#0034E0] text-[#0034E0] hover:bg-[#0034E0] hover:text-white"
            >
              <ArrowUp size={22} />
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// APP
// ---------------------------------------------------------------------------

export default function App({
  hero,
  writingSample,
  letterOfEndorsement,
  homescape,
  creativeExperience,
}: AppProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08 });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', () => {
      setScrollY(lenis.scroll);
    });

    return () => lenis.destroy();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <HeroSection hero={hero} scrollY={scrollY} />
      <WritingSampleSection writingSample={writingSample} scrollY={scrollY} />
      <LetterOfEndorsementSection letterOfEndorsement={letterOfEndorsement} />
      <HomescapeSection homescape={homescape} scrollY={scrollY} />
      <CreativeExperienceSection
        creativeExperience={creativeExperience}
        heroTitle={hero.title}
        heroByline={hero.byline}
      />
    </div>
  );
}
