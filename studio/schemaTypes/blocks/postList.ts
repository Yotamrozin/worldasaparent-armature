import { defineType, defineField } from 'sanity';

// Always the 3 most recent posts, no count field: matches what the layout is
// designed for (a 3-card row) and avoids an editable field that could break
// the design if set to an arbitrary number (see "constrain arrays" in
// SCHEMA-CONVENTIONS.md).
export const postList = defineType({
  name: 'postList',
  title: 'Latest Posts',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Optional heading shown above the list, e.g. "Latest posts".',
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({
      title: title || 'Latest Posts',
      subtitle: 'Shows the 3 most recent posts',
    }),
  },
});
