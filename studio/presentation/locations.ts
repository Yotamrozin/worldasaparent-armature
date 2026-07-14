import { defineLocations, type PresentationPluginOptions } from 'sanity/presentation';

// Location resolvers map each document type to the frontend URL(s) where it
// appears, so the Presentation Tool can show "used on" badges and keep the
// preview iframe pointed at the right page. Extend this as routed page and
// collection types are added.
export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
    homepage: defineLocations({
      select: { title: 'heroHeading' },
      resolve: (doc) => ({
        locations: [{ title: doc?.title || 'Homepage', href: '/' }],
      }),
    }),
    blogIndex: defineLocations({
      select: { title: 'title' },
      resolve: (doc) => ({
        locations: [{ title: doc?.title || 'Blog', href: '/blog' }],
      }),
    }),
    about: defineLocations({
      select: { title: 'heading' },
      resolve: (doc) => ({
        locations: [{ title: doc?.title || 'About', href: '/about' }],
      }),
    }),
    contact: defineLocations({
      select: { title: 'heading' },
      resolve: (doc) => ({
        locations: [{ title: doc?.title || 'Contact', href: '/contact' }],
      }),
    }),
    post: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || 'Post', href: `/blog/${doc?.slug ?? ''}` },
          { title: 'Blog', href: '/blog' },
        ],
      }),
    }),
  },
};
