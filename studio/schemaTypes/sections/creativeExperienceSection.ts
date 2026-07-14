import { defineType, defineField } from 'sanity';

// Bespoke, fixed-shape section specific to this site's homepage (see
// SCHEMA-CONVENTIONS.md: fixed shapes suit art-directed layouts).
export const creativeExperienceSection = defineType({
  name: 'creativeExperienceSection',
  title: 'Creative Experience',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The section heading, e.g. "Creative Professional Experience".',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'portfolioSnapshot',
      title: 'Portfolio snapshot',
      type: 'imageWithAlt',
      description: 'A screenshot of the portfolio site, linking out to it.',
    }),
    defineField({
      name: 'portfolioUrl',
      title: 'Portfolio URL',
      type: 'url',
      description: 'External link to the full portfolio site.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 5,
      description: 'A short paragraph describing this professional work.',
    }),
    defineField({
      name: 'cvFile',
      title: 'CV (PDF)',
      type: 'file',
      description: 'The downloadable CV.',
      options: { accept: 'application/pdf' },
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({
      title: title || 'Creative Experience',
      subtitle: 'Creative Experience section',
    }),
  },
});
