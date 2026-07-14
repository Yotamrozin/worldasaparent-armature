import { defineType, defineField } from 'sanity';

// Page singleton for the homepage. This site is a single-page design with
// five fixed, uniquely art-directed sections (see SCHEMA-CONVENTIONS.md:
// fixed shapes suit art-directed layouts) — so each section is a named field
// with its own bespoke shape, rather than the template's generic reusable
// blocks. `sections` stays wired per the template's "wire the dispatcher from
// day one" convention, in case this page ever needs an extra stackable block.
export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'writingSample', title: 'Writing Sample' },
    { name: 'letterOfEndorsement', title: 'Letter of Endorsement' },
    { name: 'homescape', title: 'Homescape' },
    { name: 'creativeExperience', title: 'Creative Experience' },
    { name: 'sections', title: 'Sections' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'heroSection',
      group: 'hero',
    }),
    defineField({
      name: 'writingSample',
      title: 'Writing Sample',
      type: 'writingSampleSection',
      group: 'writingSample',
    }),
    defineField({
      name: 'letterOfEndorsement',
      title: 'Letter of Endorsement',
      type: 'letterOfEndorsementSection',
      group: 'letterOfEndorsement',
    }),
    defineField({
      name: 'homescape',
      title: 'Homescape',
      type: 'homescapeSection',
      group: 'homescape',
    }),
    defineField({
      name: 'creativeExperience',
      title: 'Creative Experience',
      type: 'creativeExperienceSection',
      group: 'creativeExperience',
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'sections',
      of: [{ type: 'hero' }, { type: 'postFeatured' }, { type: 'postList' }],
      description: 'Optional extra stackable sections below the fixed page content.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Homepage' }),
  },
});
