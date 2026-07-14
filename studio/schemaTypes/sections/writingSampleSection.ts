import { defineType, defineField } from 'sanity';

// Bespoke, fixed-shape section specific to this site's homepage (see
// SCHEMA-CONVENTIONS.md: fixed shapes suit art-directed layouts).
export const writingSampleSection = defineType({
  name: 'writingSampleSection',
  title: 'Writing Sample',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The section heading, e.g. "Writing Sample".',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 4,
      description: 'A short paragraph introducing the excerpts below.',
    }),
    defineField({
      name: 'bandImages',
      title: 'Band images',
      type: 'array',
      of: [{ type: 'imageWithAlt' }],
      description: 'Decorative photos shown in the band above the excerpts. Up to 3.',
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'excerpts',
      title: 'Excerpts',
      type: 'array',
      description: 'The writing excerpts, in order.',
      of: [
        {
          type: 'object',
          name: 'excerpt',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'The excerpt title, e.g. "Excerpt I — Bonds: The First Cosmology".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 12,
              description:
                'The excerpt text. Separate paragraphs with a blank line — the page splits on it to lay the text out in two columns.',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'title' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Writing Sample', subtitle: 'Writing Sample section' }),
  },
});
