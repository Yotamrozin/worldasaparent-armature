import { defineType, defineField } from 'sanity';

// One link model for the whole site. A link is either internal (a reference to
// another document) or external (a URL), chosen via `linkType`. The irrelevant
// field is hidden and the relevant one is required, so links behave the same
// everywhere.
export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'The text shown for this link.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'linkType',
      title: 'Link type',
      type: 'string',
      description: 'Choose whether this points to a page on this site or an external URL.',
      options: {
        list: [
          { title: 'Internal page', value: 'internal' },
          { title: 'External URL', value: 'external' },
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'internal',
      title: 'Internal page',
      type: 'reference',
      description: 'The page on this site to link to.',
      // Extend this list as more page singletons and collections are added.
      to: [
        { type: 'homepage' },
        { type: 'blogIndex' },
        { type: 'about' },
        { type: 'contact' },
        { type: 'post' },
      ],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { linkType?: string };
          if (parent?.linkType === 'internal' && !value) return 'Select a page to link to.';
          return true;
        }),
    }),
    defineField({
      name: 'external',
      title: 'External URL',
      type: 'url',
      description: 'The full URL to link to, including https://',
      hidden: ({ parent }) => parent?.linkType !== 'external',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { linkType?: string };
          if (parent?.linkType === 'external' && !value) return 'Enter a URL to link to.';
          return true;
        }),
    }),
  ],
});
