import { defineType, defineField } from 'sanity';

// The single global singleton: site-wide content used across every page.
// There is exactly one of these.
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'navigation', title: 'Navigation' },
    { name: 'contact', title: 'Contact & Social' },
    { name: 'seo', title: 'Default SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Site title',
      type: 'string',
      group: 'general',
      description: 'The name of the site, used in the browser tab and as an SEO fallback.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'imageWithAlt',
      group: 'general',
      description: 'The site logo shown in the header.',
    }),
    defineField({
      name: 'primaryNav',
      title: 'Primary navigation',
      type: 'array',
      group: 'navigation',
      of: [{ type: 'link' }],
      description: 'The main menu links, in order. Keep it short — up to about 7 items.',
      validation: (rule) => rule.max(7),
    }),
    defineField({
      name: 'footerLinks',
      title: 'Footer links',
      type: 'array',
      group: 'navigation',
      of: [{ type: 'link' }],
      description: 'Secondary links shown in the site footer.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'contact',
      of: [{ type: 'link' }],
      description: 'Links to social profiles.',
    }),
    defineField({
      name: 'email',
      title: 'Contact email',
      type: 'string',
      group: 'contact',
      description: 'Public contact email address.',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'phone',
      title: 'Contact phone',
      type: 'string',
      group: 'contact',
      description: 'Public contact phone number.',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 3,
      group: 'contact',
      description: 'Physical or mailing address.',
    }),
    defineField({
      name: 'seo',
      title: 'Default SEO',
      type: 'seo',
      group: 'seo',
      description: 'Fallback metadata used when a page does not set its own.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
