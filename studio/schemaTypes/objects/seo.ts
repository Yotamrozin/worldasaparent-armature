import { defineType, defineField } from 'sanity';

// Per-document search/social metadata. siteSettings holds the defaults;
// each page or collection item can override.
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Meta title',
      type: 'string',
      description:
        'Overrides the browser tab and search-result title for this page. Keep under about 60 characters.',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'description',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description:
        'Shown in search results and social previews. Keep under about 160 characters.',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'imageWithAlt',
      description:
        'Image used when this page is shared on social media. Ideally 1200×630.',
    }),
  ],
});
