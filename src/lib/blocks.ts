import Hero from '../components/blocks/Hero.astro';
import PostFeatured from '../components/blocks/PostFeatured.astro';
import PostList from '../components/blocks/PostList.astro';

// Block dispatcher: maps a Sanity block `_type` to the Astro component that
// renders it (see SCHEMA-CONVENTIONS.md). Adding a block later is additive:
// define the schema in studio/schemaTypes/blocks/, build the component in
// src/components/blocks/, and register it here.
export const blockComponents = {
  hero: Hero,
  postFeatured: PostFeatured,
  postList: PostList,
};

export type BlockType = keyof typeof blockComponents;
