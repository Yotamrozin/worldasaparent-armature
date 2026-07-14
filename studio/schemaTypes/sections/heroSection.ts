import { defineType, defineField } from 'sanity';

// Bespoke, fixed-shape section specific to this site's homepage (see
// SCHEMA-CONVENTIONS.md: fixed shapes suit art-directed layouts). Named
// "heroSection" (not "hero") to avoid clashing with the template's generic,
// reusable `hero` block type, which this page doesn't use.
export const heroSection = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The main title, e.g. the book or project name.',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'byline',
      title: 'Byline',
      type: 'string',
      description: 'Attribution line shown beneath the title, e.g. "by Author Name".',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'imageWithAlt' }],
      description: 'Scattered photos shown around the hero. Up to 5.',
      validation: (rule) => rule.max(5),
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({ title: title || 'Hero', subtitle: 'Hero section' }),
  },
});
