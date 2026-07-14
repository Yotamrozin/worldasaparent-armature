import { defineType, defineField } from 'sanity';

// Bespoke, fixed-shape section specific to this site's homepage (see
// SCHEMA-CONVENTIONS.md: fixed shapes suit art-directed layouts). The
// richest of the five sections — a project showcase with its own media
// gallery, video embeds, and a presentations list.
export const homescapeSection = defineType({
  name: 'homescapeSection',
  title: 'Homescape',
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Media' },
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      group: 'content',
      description: 'The section heading, e.g. "Notable Artistic Practice".',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'projectTitle',
      title: 'Project title',
      type: 'string',
      group: 'content',
      description: 'The project name, e.g. "Homescape (2018)". Links to the external URL below.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      group: 'content',
      description: 'Where the project title and "More Info" button link to.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 8,
      group: 'content',
      description: 'The project description. Separate paragraphs with a blank line.',
    }),
    defineField({
      name: 'presentations',
      title: 'Notable presentations',
      type: 'array',
      group: 'content',
      of: [{ type: 'string' }],
      description: 'One line per presentation/exhibition credit, e.g. "Festival Name | City, Country (Year)".',
      validation: (rule) => rule.max(15),
    }),
    defineField({
      name: 'posterImage',
      title: 'Poster image',
      type: 'imageWithAlt',
      group: 'media',
      description: 'Fallback background image, shown if no background video is set.',
    }),
    defineField({
      name: 'logoImage',
      title: 'Logo image',
      type: 'imageWithAlt',
      group: 'media',
      description: 'Logo overlaid on the poster image (only shown when there is no background video).',
    }),
    defineField({
      name: 'backgroundVideoUrl',
      title: 'Background video URL',
      type: 'url',
      group: 'media',
      description:
        'Optional external video URL (e.g. a Wix or CDN-hosted .mp4) for the section background. If set, it replaces the poster/logo image.',
    }),
    defineField({
      name: 'featuredIn',
      title: 'Featured in',
      type: 'array',
      group: 'media',
      of: [{ type: 'imageWithAlt' }],
      description: 'Logos of festivals/publications that featured this project. Up to 4.',
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery images',
      type: 'array',
      group: 'media',
      of: [{ type: 'imageWithAlt' }],
      description: 'Photo gallery. The first image is shown large; the rest as tiles. Up to 8.',
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: 'videos',
      title: 'Videos',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'object',
          name: 'video',
          fields: [
            defineField({
              name: 'thumbnail',
              title: 'Thumbnail',
              type: 'imageWithAlt',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'embedUrl',
              title: 'Embed URL',
              type: 'url',
              description: 'The external video embed URL (e.g. a mediadelivery.net iframe URL).',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { media: 'thumbnail', title: 'embedUrl' },
          },
        },
      ],
      description: 'Video tiles shown alongside the photo gallery. Up to 4.',
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    select: { title: 'projectTitle' },
    prepare: ({ title }) => ({ title: title || 'Homescape', subtitle: 'Homescape section' }),
  },
});
