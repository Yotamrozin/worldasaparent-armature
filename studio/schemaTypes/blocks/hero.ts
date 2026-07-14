import { defineType, defineField } from 'sanity';

// The first block type. Blocks are the stackable sections a page can carry in
// its `sections` array. Adding a block later is additive: define it here, build
// the matching Astro component, and register it in the dispatcher.
export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'The main heading for this hero. Keep under about 80 characters.',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading',
      type: 'text',
      rows: 3,
      description: 'Supporting text shown beneath the heading.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'imageWithAlt',
      description: 'Feature or background image for the hero.',
    }),
    defineField({
      name: 'cta',
      title: 'Call to action',
      type: 'link',
      description: 'Optional button link.',
    }),
  ],
  preview: {
    select: { title: 'heading', media: 'image' },
    prepare: ({ title, media }) => ({
      title: title || 'Hero',
      subtitle: 'Hero block',
      media,
    }),
  },
});
