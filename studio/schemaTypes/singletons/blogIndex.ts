import { defineType, defineField } from 'sanity';

// Page singleton for the /blog listing page. Unlike the individual `post`
// documents it lists, /blog itself has no content unless something models it —
// this gives a client a title and intro to edit, same pattern as homepage.
export const blogIndex = defineType({
  name: 'blogIndex',
  title: 'Blog',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      description: 'The heading shown at the top of the blog page.',
      initialValue: 'Blog',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'A short paragraph introducing the blog, shown below the title.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Blog' }),
  },
});
