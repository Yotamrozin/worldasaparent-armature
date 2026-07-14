// Shared, isomorphic resolver: turns the raw Sanity homepage document into
// AppProps. Used both server-side (index.astro, with the full authenticated
// image builder) and client-side (LiveHomepage.tsx, with a lightweight
// public-config-only builder) for live-updating content in Presentation —
// same logic, different (injected) image URL builder.
import type { AppProps, PositionedImageProp } from './App';
import { HERO_POSITIONS, WRITING_SAMPLE_POSITIONS, FALLBACK_SLOT } from './photoPositions';

export interface SanityImage {
  asset?: { _ref?: string };
  alt?: string;
  filename?: string;
}

export interface HomepageDoc {
  hero?: { title?: string; byline?: string; images?: SanityImage[] };
  writingSample?: {
    heading?: string;
    intro?: string;
    bandImages?: SanityImage[];
    excerpts?: { title?: string; body?: string }[];
  };
  letterOfEndorsement?: {
    heading?: string;
    intro?: string;
    letterImage?: SanityImage;
    letterPdfUrl?: string;
  };
  homescape?: {
    heading?: string;
    projectTitle?: string;
    externalUrl?: string;
    description?: string;
    presentations?: string[];
    posterImage?: SanityImage;
    logoImage?: SanityImage;
    backgroundVideoUrl?: string;
    featuredIn?: SanityImage[];
    galleryImages?: SanityImage[];
    videos?: { embedUrl?: string; thumbnail?: SanityImage }[];
  };
  creativeExperience?: {
    heading?: string;
    portfolioSnapshot?: SanityImage;
    portfolioUrl?: string;
    description?: string;
    cvFileUrl?: string;
  };
}

// The single GROQ query used by both the server-rendered fetch and the live
// Presentation query — same shape in, same shape out either way.
export const HOMEPAGE_QUERY = `*[_id == "homepage"][0]{
  hero{
    title,
    byline,
    images[]{ ..., "filename": asset->originalFilename }
  },
  writingSample{
    heading,
    intro,
    bandImages[]{ ..., "filename": asset->originalFilename },
    excerpts[]{ title, body }
  },
  letterOfEndorsement{
    heading,
    intro,
    letterImage,
    "letterPdfUrl": letterPdf.asset->url
  },
  homescape{
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
    videos[]{ embedUrl, thumbnail }
  },
  creativeExperience{
    heading,
    portfolioSnapshot,
    portfolioUrl,
    description,
    "cvFileUrl": cvFile.asset->url
  }
}`;

export type UrlForImage = (
  image: SanityImage,
  opts: { width: number; height?: number },
) => string;

export function resolveHomepageProps(
  homepage: HomepageDoc | null | undefined,
  urlForImage: UrlForImage,
): AppProps {
  function resolveImage(
    image: SanityImage | undefined,
    opts: { width: number; height?: number; fallbackAlt?: string },
  ) {
    if (!image?.asset) return undefined;
    return { url: urlForImage(image, opts), alt: image.alt || opts.fallbackAlt || '' };
  }

  function resolveImages(
    images: SanityImage[] | undefined,
    opts: { width: number; height?: number; fallbackAlt?: string },
  ) {
    return (images ?? [])
      .map((img) => resolveImage(img, opts))
      .filter((img): img is NonNullable<typeof img> => Boolean(img));
  }

  function resolvePositionedImages(
    images: SanityImage[] | undefined,
    positions: typeof HERO_POSITIONS,
    opts: { width: number; height?: number; fallbackAlt?: string },
  ): PositionedImageProp[] {
    return (images ?? [])
      .map((img) => {
        const base = resolveImage(img, opts);
        if (!base) return undefined;
        const slot = (img.filename && positions[img.filename]) || FALLBACK_SLOT;
        return { ...base, ...slot };
      })
      .filter((img): img is PositionedImageProp => Boolean(img));
  }

  return {
    hero: {
      title: homepage?.hero?.title ?? 'Untitled',
      byline: homepage?.hero?.byline,
      images: resolvePositionedImages(homepage?.hero?.images, HERO_POSITIONS, {
        width: 900,
        fallbackAlt: 'Project photo',
      }),
    },
    writingSample: {
      heading: homepage?.writingSample?.heading ?? 'Writing Sample',
      intro: homepage?.writingSample?.intro,
      bandImages: resolvePositionedImages(homepage?.writingSample?.bandImages, WRITING_SAMPLE_POSITIONS, {
        width: 900,
        fallbackAlt: 'Writing sample image',
      }),
      excerpts: (homepage?.writingSample?.excerpts ?? []).map((ex) => ({
        title: ex.title ?? '',
        body: ex.body ?? '',
      })),
    },
    letterOfEndorsement: {
      heading: homepage?.letterOfEndorsement?.heading ?? 'Letter of Endorsement',
      intro: homepage?.letterOfEndorsement?.intro,
      letterImage: resolveImage(homepage?.letterOfEndorsement?.letterImage, { width: 1200 }),
      letterPdfUrl: homepage?.letterOfEndorsement?.letterPdfUrl,
    },
    homescape: {
      heading: homepage?.homescape?.heading ?? 'Notable Artistic Practice',
      projectTitle: homepage?.homescape?.projectTitle ?? '',
      externalUrl: homepage?.homescape?.externalUrl,
      description: homepage?.homescape?.description,
      presentations: homepage?.homescape?.presentations ?? [],
      posterImage: resolveImage(homepage?.homescape?.posterImage, { width: 1920 }),
      logoImage: resolveImage(homepage?.homescape?.logoImage, { width: 800 }),
      backgroundVideoUrl: homepage?.homescape?.backgroundVideoUrl,
      featuredIn: resolveImages(homepage?.homescape?.featuredIn, { width: 400 }),
      galleryImages: resolveImages(homepage?.homescape?.galleryImages, { width: 1600 }),
      videos: (homepage?.homescape?.videos ?? [])
        .map((v) => {
          const thumbnail = resolveImage(v.thumbnail, { width: 1200 });
          return thumbnail && v.embedUrl ? { thumbnail, embedUrl: v.embedUrl } : undefined;
        })
        .filter((v): v is { thumbnail: { url: string; alt: string }; embedUrl: string } => Boolean(v)),
    },
    creativeExperience: {
      heading: homepage?.creativeExperience?.heading ?? 'Creative Professional Experience',
      portfolioSnapshot: resolveImage(homepage?.creativeExperience?.portfolioSnapshot, { width: 1600 }),
      portfolioUrl: homepage?.creativeExperience?.portfolioUrl,
      description: homepage?.creativeExperience?.description,
      cvFileUrl: homepage?.creativeExperience?.cvFileUrl,
    },
  };
}
