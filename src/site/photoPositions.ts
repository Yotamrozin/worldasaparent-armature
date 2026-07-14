// Hand-placed photo positions (design, not content) for the hero and writing
// sample sections. Resolved server-side (see index.astro) against each
// image's original filename, then baked directly into the props the client
// React island receives — no lookup happens client-side, so there's no
// chance of a client/server prop-hydration mismatch silently falling back
// to the same position for every image.
export interface PhotoSlot {
  factor: number;
  revealDelay?: number;
  desktop: { left: string; top: string; width: string; aspectRatio: string };
  mobile: { left: string; top: string; width: string; aspectRatio: string };
}

export const HERO_POSITIONS: Record<string, PhotoSlot> = {
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

export const WRITING_SAMPLE_POSITIONS: Record<string, PhotoSlot> = {
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
export const FALLBACK_SLOT: PhotoSlot = {
  factor: 0.12,
  desktop: { left: '42%', top: '40%', width: '20%', aspectRatio: '4/3' },
  mobile: { left: '35%', top: '40%', width: '30%', aspectRatio: '4/3' },
};
