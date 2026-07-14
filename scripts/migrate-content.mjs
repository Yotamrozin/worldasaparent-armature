// One-time content migration: uploads the real images/PDFs from the original
// worldasaparent-2 site (read-only source, never modified) as Sanity assets,
// and creates the real `homepage` document in this project's Sanity dataset.
//
// Run with:
//   npx sanity exec scripts/migrate-content.mjs --with-user-token           (dry run — logs only)
//   npx sanity exec scripts/migrate-content.mjs --with-user-token -- --write (actually writes to Sanity)
//
// The excerpts and presentations list are extracted from the original
// source file via regex rather than retyped by hand, since they're real
// creative-writing content and retyping risks introducing errors.

import fs from 'node:fs';
import path from 'node:path';
import { getCliClient } from 'sanity/cli';

const SOURCE_ROOT = 'C:/Users/gideo/ShipStudio/worldasaparent-2';
const APP_TSX = path.join(SOURCE_ROOT, 'src/site/App.tsx');
const WRITE = process.argv.includes('--write');

const client = getCliClient({ dataset: 'worldasaparent', apiVersion: '2025-02-19' });

const appSource = fs.readFileSync(APP_TSX, 'utf8');

// ---------------------------------------------------------------------------
// Extract excerpts (title/col1/col2) and presentations via regex, so the
// real literary text is copied byte-for-byte rather than retyped.
// ---------------------------------------------------------------------------

function extractExcerpts(source) {
  const re = /title:\s*"([^"]+)",\s*col1:\s*`([\s\S]*?)`,\s*col2:\s*`([\s\S]*?)`,\s*\}/g;
  const excerpts = [];
  let m;
  while ((m = re.exec(source))) {
    const [, title, col1, col2] = m;
    // The source is read as raw text, not executed as JS, so literal `\n`
    // escape sequences inside the template literals need converting to real
    // newlines (a JS engine would do this automatically when parsing the file).
    const c1 = col1.trim().replace(/\\n/g, '\n');
    const c2 = col2.trim().replace(/\\n/g, '\n');
    // Clean paragraph break if col1 ends with sentence-ending punctuation,
    // otherwise col2 continues a sentence split mid-word for the 2-column
    // layout — join with a single space instead of a paragraph break.
    const joiner = /[.!?"']\s*$/.test(c1) ? '\n\n' : ' ';
    excerpts.push({ _type: 'excerpt', _key: slugKey(title), title, body: c1 + joiner + c2 });
  }
  return excerpts;
}

function extractPresentations(source) {
  const block = source.match(/Notable Presentations[\s\S]*?\[([\s\S]*?)\]\.map/)?.[1];
  if (!block) throw new Error('Could not find presentations list in source');
  const re = /"([^"]+)"/g;
  const items = [];
  let m;
  while ((m = re.exec(block))) items.push(m[1]);
  return items;
}

function slugKey(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '-' + Math.random().toString(36).slice(2, 8);
}

const excerpts = extractExcerpts(appSource);
const presentations = extractPresentations(appSource);

console.log(`Extracted ${excerpts.length} excerpts:`);
for (const ex of excerpts) {
  console.log(`  - "${ex.title}" (${ex.body.length} chars)`);
}
console.log(`Extracted ${presentations.length} presentations.`);

if (excerpts.length !== 3) throw new Error(`Expected 3 excerpts, got ${excerpts.length}`);
if (presentations.length !== 9) throw new Error(`Expected 9 presentations, got ${presentations.length}`);

// ---------------------------------------------------------------------------
// Asset upload helpers
// ---------------------------------------------------------------------------

const assetCache = new Map();

async function uploadImage(relPath, altText) {
  const absPath = path.join(SOURCE_ROOT, 'public', relPath);
  if (!fs.existsSync(absPath)) throw new Error(`Missing image: ${absPath}`);
  if (!WRITE) {
    console.log(`  [dry-run] would upload image: ${relPath}`);
    return { _type: 'imageWithAlt', alt: altText };
  }
  const cacheKey = relPath;
  if (assetCache.has(cacheKey)) {
    return { _type: 'imageWithAlt', asset: { _type: 'reference', _ref: assetCache.get(cacheKey) }, alt: altText };
  }
  const buffer = fs.readFileSync(absPath);
  const asset = await client.assets.upload('image', buffer, { filename: path.basename(absPath) });
  assetCache.set(cacheKey, asset._id);
  console.log(`  uploaded image: ${relPath} -> ${asset._id}`);
  return { _type: 'imageWithAlt', asset: { _type: 'reference', _ref: asset._id }, alt: altText };
}

async function uploadFile(relPath) {
  const absPath = path.join(SOURCE_ROOT, 'public', relPath);
  if (!fs.existsSync(absPath)) throw new Error(`Missing file: ${absPath}`);
  if (!WRITE) {
    console.log(`  [dry-run] would upload file: ${relPath}`);
    return undefined;
  }
  const buffer = fs.readFileSync(absPath);
  const asset = await client.assets.upload('file', buffer, { filename: path.basename(absPath) });
  console.log(`  uploaded file: ${relPath} -> ${asset._id}`);
  return { _type: 'file', asset: { _type: 'reference', _ref: asset._id } };
}

// ---------------------------------------------------------------------------
// Build the homepage document
// ---------------------------------------------------------------------------

async function buildDocument() {
  const hero = {
    title: 'THE WORLD AS A PARENT',
    byline: 'by Yotam Rozin',
    images: await Promise.all(
      [
        '/imports/01Hero/c9d9ead4369bdec13806dd655ba00bba73b6deb6.png',
        '/imports/01Hero/b4eebfce99f050ddf2605bf673f8616ed04b7ca6.png',
        '/imports/01Hero/122608485635e846f39d10ad2694f59023f909dd.png',
        '/imports/01Hero/833d158ae763c459812b242f17917a96b903e1d7.png',
        '/imports/01Hero/e8c226f0ce4ebb0e326ec38a4dee81fc142a5589.png',
      ].map((p) => uploadImage(p, 'Project photo')),
    ),
  };

  const writingSample = {
    heading: 'Writing Sample',
    intro:
      "Three short excerpts from The World as a Parent illustrate the book's movement between historical exploration, poetic inquiry, and narrative life-writing. Together they show how the book weaves ancient cosmological narratives, our shared experience of being in the womb, and the questions sparked by Janusz Korczak's life and writing into a single, sustained literary inquiry into the world as a parent.",
    bandImages: await Promise.all(
      [
        '/imports/02WritingSample/7500cd3cadaacce24f3eb950d585efc0e01c6e5d.png',
        '/imports/02WritingSample/87ebe7e7d714c3c7b3bdeb076940292155a70ca7.png',
        '/imports/02WritingSample/eb6add21a75ba300f515952b4877c3540c34ec6e.png',
      ].map((p) => uploadImage(p, 'Writing sample image')),
    ),
    excerpts,
  };

  const letterOfEndorsement = {
    heading: 'Letter of Endorsement',
    intro:
      'A letter from Joey Connolly, former Head of Faber Academy, who has mentored the development of this manuscript and its literary voice.',
    letterImage: await uploadImage(
      '/imports/03LetterOfEndorsement/425056c595d4249bcc2d26dab5c417aee0627980.png',
      'Letter of Endorsement by Joey Connolly',
    ),
    letterPdf: await uploadFile('/imports/Joey_Connolly_-_Letter_of_Endorsement.pdf'),
  };

  const homescape = {
    heading: 'Notable Artistic Practice',
    projectTitle: 'Homescape (2018)',
    externalUrl: 'https://yotamrozin.wixsite.com/yotam-rozin/homescape',
    description:
      "Through a guided meditation, participants are drawn into the dark liminal landscape of the fields surrounding Ma'as, the artist's hometown. They then freely explore regions close to home as well as their own personal uncharted territories.\n\nIn the midst of the native biota, vestiges of British colonial rule, and ruins of Palestinian settlements, players encounter the inhabitants of the cultural unconscious, who reside together to form the sites of the artist's childhood memories.\n\nPresenting the piece throughout 2016–2018 presented an opportunity to engage personally with diverse communities around the world and people of all ages.",
    presentations,
    posterImage: await uploadImage('/imports/04Homescape-1/homescape-poster.jpg', 'Homescape background'),
    logoImage: await uploadImage(
      '/imports/04Homescape-1/8fe3d075165fceba9994ba4d006d898949e0cb8c.png',
      'Homescape logo',
    ),
    backgroundVideoUrl:
      'https://video.wixstatic.com/video/f7efcb_7a31416939fb4b82aa5c7b6164eb3e36/1080p/mp4/file.mp4',
    featuredIn: await Promise.all(
      [
        ['/imports/04Homescape-1/1a317e0205330e43c338275a95c89c9b5b426043.png', 'A MAZE festival'],
        ['/imports/04Homescape-1/9eb83c2137abc4b8dfaa47b9e37c46c86e4bbe7f.png', 'IDFA DocLab'],
        ['/imports/04Homescape-1/25044e89d050aa4f69cd442c97970bc283ab6789.png', 'Festival feature'],
      ].map(([p, alt]) => uploadImage(p, alt)),
    ),
    galleryImages: await Promise.all(
      [
        ['/imports/04Homescape-1/42968b4612124e72b9c4e415eb51c6b5d546b166.png', 'Homescape VR experience'],
        ['/imports/04Homescape-1/0b4a3b54c7a178636f2a8222c254ec1ef2895514.png', 'Homescape gallery image 1'],
        ['/imports/04Homescape-1/30271de092364d67376dc6598e2c6935b33c4288.png', 'Homescape gallery image 2'],
        ['/imports/04Homescape-1/4ce7dac195c92073da19f7145fb2917f5a18d0fe.png', 'Homescape gallery image 3'],
        ['/imports/04Homescape-1/a559f69a08fe7846f0d04fdb615bc6514c4022a5.png', 'Homescape gallery image 4'],
        ['/imports/04Homescape-1/gallery-451.jpg', 'Homescape gallery image 5'],
      ].map(([p, alt]) => uploadImage(p, alt)),
    ),
    videos: await Promise.all(
      [
        [
          '/imports/04Homescape-1/yt-NjqbatBl7vs.jpg',
          'Homescape — Al Jazeera feature',
          'https://iframe.mediadelivery.net/embed/504938/11700986-9e58-4255-b155-70af30cbebb7',
        ],
        [
          '/imports/04Homescape-1/yt-tEccUh0s3mI.jpg',
          'Homescape — video',
          'https://iframe.mediadelivery.net/embed/504938/f6a09cec-73a1-424b-82ed-ebf85165bb27',
        ],
      ].map(async ([thumb, alt, embedUrl]) => ({
        _type: 'video',
        _key: slugKey(alt),
        thumbnail: await uploadImage(thumb, alt),
        embedUrl,
      })),
    ),
  };

  const creativeExperience = {
    heading: 'Creative Professional Experience',
    portfolioSnapshot: await uploadImage(
      '/imports/05CreativeProfessionalExperience/yotamrozin-snapshot.png',
      'Snapshot of yotamrozin.com',
    ),
    portfolioUrl: 'https://www.yotamrozin.com/',
    description:
      'Alongside my artistic practice, I work as an independent multidisciplinary designer and creative lead. I manage projects from initial strategy through to final delivery, overseeing timelines, budgets, and project scope while designing brands, websites, motion graphics, and digital experiences. My work combines creative direction, systems thinking, and hands-on design to deliver cohesive and impactful outcomes for clients.',
    cvFile: await uploadFile('/imports/Yotam_Rozin_CV_2026.pdf'),
  };

  return {
    _id: 'homepage',
    _type: 'homepage',
    hero,
    writingSample,
    letterOfEndorsement,
    homescape,
    creativeExperience,
  };
}

const doc = await buildDocument();

if (!WRITE) {
  console.log('\n--- DRY RUN: no data written. Re-run with -- --write to actually upload/create. ---');
  console.log(JSON.stringify(doc, null, 2).slice(0, 4000) + '\n... (truncated)');
} else {
  const result = await client.createOrReplace(doc);
  console.log(`\nCreated/updated homepage document: ${result._id}`);
}
