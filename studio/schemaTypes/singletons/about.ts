import { defineType, defineField } from 'sanity';

// Page singleton for /about. Fixed shape (heading, intro, image), with the
// door left open for blocks via `sections`, same pattern as homepage.
export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'sections', title: 'Sections' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      group: 'content',
      description: 'The main heading at the top of the About page.',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'The main paragraph introducing who you are.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'imageWithAlt',
      group: 'content',
      description: 'An optional photo or image for the page.',
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'sections',
      of: [{ type: 'hero' }, { type: 'postFeatured' }, { type: 'postList' }],
      description: 'Optional stackable sections below the intro.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'About' }),
  },
});
