import { defineType, defineField } from 'sanity';

// First collection type: many documents, each with a slug, listed and
// detailed on the site (see SCHEMA-CONVENTIONS.md). Unlike singletons, this
// type lists normally in the Studio and clients can create as many as they want.
export const post = defineType({
  name: 'post',
  title: 'Post',
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
      description: 'The post title, shown on cards and at the top of the post.',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      description: 'The URL path for this post, e.g. /blog/my-post.',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'datetime',
      group: 'content',
      description: 'Used to order posts on the blog index and the latest-posts block.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'A short summary shown on cards and grids. Keep under about 200 characters.',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'imageWithAlt',
      group: 'content',
      description: 'Shown on cards and at the top of the post.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [{ type: 'block' }],
      description: 'The full content of the post, shown on the post page below the excerpt.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Published date, new first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', media: 'mainImage', date: 'publishedAt' },
    prepare: ({ title, media, date }) => ({
      title,
      media,
      subtitle: date ? new Date(date).toLocaleDateString() : 'No date',
    }),
  },
});
