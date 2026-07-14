import { defineType, defineField } from 'sanity';

// Manual pick, not "most recent": an editor explicitly chooses which post to
// feature, so they stay in control of what gets promoted (e.g. keeping an
// evergreen post featured instead of it being bumped by every new publish).
export const postFeatured = defineType({
  name: 'postFeatured',
  title: 'Featured Post',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Optional heading shown above the featured post, e.g. "Featured".',
    }),
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{ type: 'post' }],
      description: 'The post to feature.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'post.title', media: 'post.mainImage' },
    prepare: ({ title, media }) => ({
      title: title || 'Featured post',
      subtitle: 'Featured post block',
      media,
    }),
  },
});
