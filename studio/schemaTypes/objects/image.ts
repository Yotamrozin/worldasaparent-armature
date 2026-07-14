import { defineType, defineField } from 'sanity';

// Sanity's built-in `image` type is a reserved name and cannot be redefined,
// so the alt-required wrapper is named `imageWithAlt`. Use this everywhere an
// image is editable — it forces alt text, keeping the site accessible by default.
export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative text',
      type: 'string',
      description:
        'Describes the image for screen readers and when the image fails to load. Required.',
      validation: (rule) => rule.required(),
    }),
  ],
});
