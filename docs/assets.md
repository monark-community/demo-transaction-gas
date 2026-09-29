# Assets

## Photography

All photos are from Unsplash under the free [Unsplash License](https://unsplash.com/license). None is Unsplash+: each was downloaded through its `unsplash.com/photos/<id>/download` link, which redirected to `images.unsplash.com` (Unsplash+ images are served from `plus.unsplash.com`). They are 2,000 px on the long edge, compressed (JPEG quality 72, about 300 KB each), served from `public/images/` with `next/image`, and credited on `/credits`, which the footer links to.

| File | Unsplash page | Photographer | Profile | Used on |
|-|-|-|-|-|
| `public/images/newcomers.jpg` | https://unsplash.com/photos/man-and-woman-laughing-at-smartphone-Y4zNMW3pQAs | Karthik Balakrishnan | https://unsplash.com/@karthikb351 | Home, "Built for the first transaction": newcomers; `/credits` |
| `public/images/community.jpg` | https://unsplash.com/photos/diverse-group-of-students-gathered-around-laptop-kp7qkHTgSKc | Vitaly Gariev | https://unsplash.com/@silverkblack | Home, same section: communities and dApps; `/credits` |
| `public/images/partners.jpg` | https://unsplash.com/photos/customer-paying-with-smartphone-at-outdoor-table-jMYvuqEkCEY | SpotOn | https://unsplash.com/@spotonpos | Home, same section: local partners and brands; `/credits` |

## Monark brand assets

From `lovable-migration/brand-refs/` and the [monark-community/website](https://github.com/monark-community/website) repo, used per `monark-brand-guidelines.md`:

| File | Source | Used for |
|-|-|-|
| `public/brand/monark-mark.svg`, `src/app/icon.svg` | brand-refs `logos/svg/standalone/logo-branded-standalone.svg` | Header brand, favicon, wallet prompt, connect gate, Open Graph image |
| `public/brand/monark-horizontal-{light,dark}.svg` | website `public/vectors/brand/horizontal/` | Footer Monark band |
| `public/brand/monark-vertical-{light,dark}.svg` | brand-refs `logos/svg/vertical/` | 404 page |
| `public/brand/monark-mesh.svg` | website `public/vectors/decorative/monark-mesh.svg` | Home hero only |
| `public/brand/socials/*.svg` | website `public/vectors/socials/` | Footer social icons |

## Built in code

- Icons: [Lucide](https://lucide.dev) (ISC License) only.
- Diagrams and UI illustrations, drawn in JSX with flat orange strokes: the hero's live send card (`src/components/home/hero-card.tsx`), the route cascade (`src/components/demo/route-list.tsx` and `/how-it-works`), the fee split (`src/components/diagrams/fee-split.tsx`) and the tank gauge (`src/components/demo/tank-view.tsx`).
- Open Graph image per locale, generated with `next/og` (`src/app/[locale]/opengraph-image.tsx`).
- Type: Nunito Sans (SIL Open Font License) through `next/font/google`.
