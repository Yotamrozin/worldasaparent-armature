# Schema Conventions

How content is modelled in every client site built from this template. The aim is a consistent, guardrailed structure that makes client editing safe and predictable, and that stays easy to extend later.

## The rule that matters

If it is in the schema, the client can edit it. If it is not, they can't. So modelling content is the same act as deciding what is editable. Model deliberately. Keep design, layout, and anything you don't want touched out of the schema and in code.

## Three content shapes

Everything fits one of three shapes.

### 1. `siteSettings`, a single global singleton

Site-wide content that appears across pages: site title, logo, primary navigation, footer, social links, contact details, and default SEO. There is exactly one of these. Edited once, used everywhere.

### 2. Page singletons

One document per fixed page: `homepage`, `about`, `contact`. Each is a single document with named fields for that page's content. There is exactly one of each.

### 3. Collections

Repeatable content: `project`, `post`, `teamMember`. Many documents of the same type, each with a slug, listed and detailed on the site.

Quick test when unsure: if there is exactly one forever, it is a singleton; if there can be more than one, it is a collection.

## Fixed shape now, blocks ready

Pages start as **fixed shapes**: named fields in a defined order (`heroHeading`, `heroImage`, `introText`, and so on). This is the fastest thing to ship, it suits art-directed layouts, and it keeps clients safely inside the design.

To stay future-proof without building a page builder, every page also renders through a **block dispatcher** and can optionally carry a `sections` array of blocks. Wire the dispatcher from day one even if you enable no blocks at first.

### The dispatcher

`src/lib/blocks.ts` maps a block's `_type` to an Astro component:

```ts
import Hero from "../components/blocks/Hero.astro";
import Gallery from "../components/blocks/Gallery.astro";
import Quote from "../components/blocks/Quote.astro";

export const blockComponents = {
  hero: Hero,
  gallery: Gallery,
  quote: Quote,
};
```

A page template loops the `sections` array and renders the matching component per block. Adding a new block type later is three additive steps:

1. Add a block object type in `studio/schemaTypes/blocks/`.
2. Build the matching Astro component in `src/components/blocks/`.
3. Register it in the dispatcher.

Nothing already live has to change to gain the capability. You only run a migration if you want to convert an existing fixed-shape page into blocks (see Migrations).

## Reusable objects

Define these once and reuse them everywhere. Consistency here is what makes the whole system feel coherent.

### `seo`

Per-document meta: title, description, and an OG image. `siteSettings` holds the defaults; each page and collection item can override.

### `link`

One link model that handles both internal references and external URLs, so links behave the same everywhere.

### `image` with required `alt`

Wrap Sanity's image type so alt text is required. This keeps sites accessible by default and stops clients shipping images with no alt.

## Field guardrails

Every field is a small contract with the client. Conventions:

- **Describe every field.** Use `description` to say what the field is for and any constraints. For example: "The large heading at the top. Keep under about 60 characters."
- **Validate.** Mark required fields required. Set max lengths where layout depends on it. Constrain what can go where.
- **Group long documents.** Use fieldsets or groups so a page document reads as clear sections, not a wall of fields.
- **No orphan fields.** If a field exists in the schema it should render somewhere on the site. Editable fields that do nothing confuse clients.
- **Constrain arrays.** Where a design holds three items, cap the array at three. The schema should mirror what the layout can actually take.

## Naming

- Types: singular camelCase (`project`, `siteSettings`, `teamMember`).
- Singletons named for the page or purpose (`homepage`, `about`).
- Block types named for what they are (`hero`, `gallery`, `logoCloud`).
- Fields: camelCase, descriptive (`heroHeading`, not `title2`).

## Making click-to-edit work

For the Presentation Tool's click-to-edit to land on the right field, two things need to be in place:

- **Location resolvers** in the Studio config, mapping each document type to the URL or URLs where it appears, so "open in Studio" and "used on" links resolve correctly.
- **Stega encoding** turned on in draft mode, via the `loadQuery` wrapper, so rendered text carries the invisible source map the overlays read.

The exact wiring (draft mode routes, the visual editing component, the `presentationTool` config) is standard and lives in the template's `lib/sanity` and `sanity.config.ts`. Follow Sanity's current Astro visual editing guide when updating it, since the integration details move between versions.

## Migrations

Schema changes do not rewrite existing content on their own in Sanity. Adding a field or a block type is safe and additive: existing documents simply don't have the new field until someone fills it in.

When you do need to reshape existing content, for example converting a page's fixed fields into a `sections` block array, use Sanity's migration tooling:

```
sanity migration create "Convert homepage hero to sections"
# edit the generated script
sanity migration run <id>            # dry run by default
sanity migration run <id> --no-dry-run
```

Export the dataset as a backup first. Migrations run as scripted, reviewable transforms, so reshaping content stays a controlled step rather than a manual redo.

## A worked example: homepage

Fixed shape, with the door left open for blocks.

```ts
import { defineType, defineField } from "sanity";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "sections", title: "Sections" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "heroHeading",
      title: "Hero heading",
      type: "string",
      group: "hero",
      description: "The large heading at the top. Keep it short.",
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image", // your alt-required wrapper
      group: "hero",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      group: "sections",
      of: [{ type: "hero" }, { type: "gallery" }, { type: "quote" }],
      description: "Optional stackable sections below the hero.",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
});
```

The hero is fixed and always present. The `sections` array is there from day one but can start empty, or be left out entirely until a client needs it. Either way the render path already knows how to handle blocks, so adding them later costs almost nothing.
