import { defineType, defineField } from 'sanity';

// Bespoke, fixed-shape section specific to this site's homepage (see
// SCHEMA-CONVENTIONS.md: fixed shapes suit art-directed layouts).
export const letterOfEndorsementSection = defineType({
  name: 'letterOfEndorsementSection',
  title: 'Letter of Endorsement',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The section heading, e.g. "Letter of Endorsement".',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      description: 'A short paragraph introducing who wrote the letter and why.',
    }),
    defineField({
      name: 'letterImage',
      title: 'Letter image',
      type: 'imageWithAlt',
      description: 'A photo or scan of the letter.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'letterPdf',
      title: 'Letter PDF',
      type: 'file',
      description: 'The full letter as a downloadable PDF. Clicking the image opens this.',
      options: { accept: 'application/pdf' },
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({
      title: title || 'Letter of Endorsement',
      subtitle: 'Letter of Endorsement section',
    }),
  },
});
