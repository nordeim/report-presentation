export const SITE_SEEDS = [
  {
    slug: "bsc",
    name: "Church of the Blessed Sacrament",
    shortName: "BSC",
    url: "https://blessed-sacrament-church.jesspete.shop/",
    repoUrl: "https://github.com/nordeim/blessed-sacrament-church",
    tagline: "A Household of Faith, Hope & Love.",
    headline: "A tent of meeting.",
    displayFont: "Fraunces",
    bodyFont: "Source Sans 3",
    themeColor: "#0a1122",
    architecture: "1965 modernist Tent of Meeting — folded blue roof by Y. Gordon Dowsett",
    founded: "Parish since 1958 · church consecrated 1965",
    address: "1 Commonwealth Drive, Queenstown, Singapore 149603",
    version: "1.5.0",
    heroImage: "/images/bsc-tent.jpg",
    tokenPrefix: "bsc",
    overallScore: 8.67,
    verdict:
      "The more battle-tested sister. Sapphire tokens and Fraunces give Queenstown a contemporary, magazine-warm voice that matches the modernist tent. Serve sits in primary nav, and nineteen audit rounds left a deeper a11y and E2E harness. Visual identity is slightly less parish-specific than OLL because terracotta/pine are editorial rather than liturgical.",
  },
  {
    slug: "oll",
    name: "Church of Our Lady of Lourdes",
    shortName: "OLL",
    url: "https://our-lady-of-lourdes.jesspete.shop/",
    repoUrl: "https://github.com/nordeim/ourladyoflourdes",
    tagline: "The grotto in the city.",
    headline: "The grotto in the city.",
    displayFont: "Cormorant Garamond",
    bodyFont: "Source Sans 3",
    themeColor: "#0a1428",
    architecture: "1888 Gothic Revival · National Monument 2005 · first Tamil Catholic parish",
    founded: "Completed 13 May 1888",
    address: "50 Ophir Road, Rochor, Singapore 188690",
    version: "1.0.0",
    heroImage: "/images/oll-spire.jpg",
    tokenPrefix: "oll",
    overallScore: 8.79,
    verdict:
      "The stronger visual identity for its building. Cormorant Garamond, a deeper Marian blue, and rose/sage accents read as liturgy rather than magazine. A dedicated Sacraments page and a public-holiday Mass card improve visitor IA. Craft is inherited from BSC rather than independently matured — 71 unit tests versus 181, no Serve path in primary nav.",
  },
] as const;

export const CRITERIA_SEEDS = [
  {
    slug: "brand-fit",
    name: "Visual identity & parish fit",
    description:
      "Does the type, colour, imagery, and voice feel inevitable for this building and this congregation — or could it be any parish?",
    sortOrder: 1,
  },
  {
    slug: "typography",
    name: "Typography",
    description:
      "Display/body pairing, hierarchy, tracking, measure, and whether the serif’s character matches the architecture.",
    sortOrder: 2,
  },
  {
    slug: "colour",
    name: "Colour system",
    description:
      "Token vocabulary, semantic range, contrast on cream/parchment, and whether accents carry meaning.",
    sortOrder: 3,
  },
  {
    slug: "layout",
    name: "Layout & composition",
    description:
      "Hero, overlap devices, section rhythm, radii, density, and how the page breathes on mobile versus desktop.",
    sortOrder: 4,
  },
  {
    slug: "components",
    name: "UI components",
    description:
      "Buttons, cards, nav, heroes, timelines, accordions — consistency, states, and conversion affordances.",
    sortOrder: 5,
  },
  {
    slug: "motion",
    name: "Motion & interaction",
    description:
      "Entrance, hover, drawer, and route motion — restraint, liturgical pacing, reduced-motion gates.",
    sortOrder: 6,
  },
  {
    slug: "accessibility",
    name: "Accessibility",
    description:
      "Skip link, focus rings, landmarks, drawer keyboard contracts, contrast, and motion preferences.",
    sortOrder: 7,
  },
  {
    slug: "ia",
    name: "Information architecture",
    description:
      "Primary nav, aliases, hash anchors, page inventory, and whether a first-time visitor can find Mass, sacraments, and a way to serve.",
    sortOrder: 8,
  },
  {
    slug: "voice",
    name: "Voice & content craft",
    description:
      "Headline, quote card, alt text, parish facts as data, and whether copy sounds like this household.",
    sortOrder: 9,
  },
  {
    slug: "craft",
    name: "Craft, trust & polish",
    description:
      "Test depth, CSP, metadata, and the quiet signals that a site has been lived in rather than forked.",
    sortOrder: 10,
  },
] as const;

export const SCORE_NOTES: Record<string, { bsc: { score: number; notes: string }; oll: { score: number; notes: string } }> =
  {
    "brand-fit": {
      bsc: {
        score: 8.5,
        notes:
          "Sapphire is an honest reading of the folded blue roof. Fraunces is warm and contemporary — a household, not a monument. The identity is strong, but terracotta/pine read as editorial chips rather than parish symbols, and some photography lineage is shared with the template.",
      },
      oll: {
        score: 9.2,
        notes:
          "Marian blue, rose (Mystical Rose), and sage (formation) are semantically tied to Lourdes. Cormorant Garamond’s high contrast echoes Gothic verticals. README and Emblem (gothic arch + Marian star) commit to this building. Strongest dimension on either site.",
      },
    },
    typography: {
      bsc: {
        score: 8.4,
        notes:
          "Fraunces (variable, soft terminals, generous x-height) + Source Sans 3. Feels like a modern Catholic magazine. Excellent for welcome; slightly less inevitable for a conserved 1965 concrete tent than a crisper modernist grotesque would be.",
      },
      oll: {
        score: 8.8,
        notes:
          "Cormorant Garamond 400–700 italic + Source Sans 3. Sharp serifs and vertical stress match a National Monument. At display sizes it is more solemn; at small sizes the high contrast is a little more fragile than Fraunces, but the architectural rhyme is better.",
      },
    },
    colour: {
      bsc: {
        score: 8.6,
        notes:
          "33 bsc-* tokens: cream #f8f5ef, parchment #efe8d8, sapphire-500 #3458a8 through 950 #0a1122, gold-400 #d4ad42, terracotta and pine scales. Coherent, roof-true, slightly cooler/brighter than OLL.",
      },
      oll: {
        score: 9.0,
        notes:
          "33 oll-* tokens on the same cream/gold recipe, but blue is deeper and greener (#0a1428 / #2c4a8e) with rose-600 #8a4a5f and sage-600 #2f4f37. More range for category chips without breaking the liturgical register.",
      },
    },
    layout: {
      bsc: {
        score: 8.7,
        notes:
          "Full-bleed Ken Burns hero, bottom-heavy scrim, overlapping parchment quote card, cream/parchment bands, 2–6px editorial radii, card grids 1→2→3/4. Shared composition language with OLL — by design, not coincidence.",
      },
      oll: {
        score: 8.7,
        notes:
          "Same scaffold: hero overlap, gold-rule hairlines, grain, adobe texture, sticky header, drawer. The gothic building is not expressed in layout geometry (no pointed-arch frames beyond the Emblem). Composition is excellent and identical.",
      },
    },
    components: {
      bsc: {
        score: 8.5,
        notes:
          "Button (primary gold / secondary sapphire / ghost / outline-light), PageHero, Timeline, Accordion, SafeImage, BackToTop, ScrollProgress. Serve is a first-class page and primary-nav item — a real conversion component the fork dropped.",
      },
      oll: {
        score: 8.6,
        notes:
          "Same primitive set, restyled with oll-* tokens. Sacraments page with jump nav is a better pastoral component than BSC’s Worship-only treatment. Mass schedule adds a Public Holidays card. Missing Serve.",
      },
    },
    motion: {
      bsc: {
        score: 8.8,
        notes:
          "Sacred Motion set: rise-in (cubic-bezier 0.22,1,0.36,1) with d1–d4 stagger, Ken Burns 20s, bloom-drift 14s, card-lift, gold-rule draw, drawer-in. All gated by prefers-reduced-motion. Transform/opacity only.",
      },
      oll: {
        score: 8.8,
        notes:
          "Byte-for-byte the same motion vocabulary in src/index.css. No parish-specific motion (no candle flicker, no rose-window rotate — correctly; restraint is the point). Score matches because the system is shared, not because it was independently invented.",
      },
    },
    accessibility: {
      bsc: {
        score: 9.0,
        notes:
          "Skip link, global 2px gold-400 focus ring with 3px offset, nav landmarks, stateful Open/Close menu, Escape for dropdown, focus-trapped drawer, reduced-motion, print reveal reset. Round-16/18 added dedicated a11y tests — the deeper harness.",
      },
      oll: {
        score: 8.9,
        notes:
          "Same contracts ported: skip link, gold focus, drawer, reduced-motion, Accordion single-open. Slightly less test evidence (no Header.test.tsx in the component listing). Implementation quality is high; proof is thinner.",
      },
    },
    ia: {
      bsc: {
        score: 8.3,
        notes:
          "Primary: Home, About▾, Worship▾, Ministries▾, News & Events, Serve. Footer adds Give, FAQ, Contact. Sacraments live under Worship. Six Sunday Masses including language communities. Strong volunteer path; weaker sacrament discoverability.",
      },
      oll: {
        score: 8.9,
        notes:
          "Primary: Home, About▾, Worship▾, Sacraments▾ (Infant Baptism, Matrimony, Reconciliation, Anointing), Ministries▾, News & Events. Public-holiday Mass card. Give is footer-only (same as BSC). No Serve. Better for a visitor asking “how do I baptise my child?”",
      },
    },
    voice: {
      bsc: {
        score: 8.7,
        notes:
          "“A tent of meeting.” / “You are not a visitor here. You are expected.” Household voice, SS.CC. identity, Queenstown specificity. Alt text on the tent roof is meaningful. Data-driven copy in src/data/* with contract tests.",
      },
      oll: {
        score: 8.6,
        notes:
          "“The grotto in the city.” Definite article claims the landmark. Tamil + English bilingual Mass is first-class in the data model. Slightly more formal, monument register. Emblem copy in source (“gothic arch — the grotto niche”) shows intent.",
      },
    },
    craft: {
      bsc: {
        score: 9.2,
        notes:
          "React 19.2.8 / Vite 7.3.6 / Tailwind 4, HashRouter, CSP sha256 pinning, JSON-LD Church, OG tags. 29 files / 181 unit tests, 67 e2e, ~19 design-audit rounds. This is the upstream that OLL forked. Highest craft score in the pair.",
      },
      oll: {
        score: 8.4,
        notes:
          "Same stack and CSP injector, 12 files / 71 unit tests, 31 built e2e, version 1.0.0. Hardening was ported in the 2026-09 remediation, not grown in place. Trustworthy, but the scar tissue of a long audit history is BSC’s.",
      },
    },
  };

export const FINDING_SEEDS = [
  {
    siteSlug: null,
    severity: "high",
    title: "Sister sites, not two identities",
    description:
      "OLL is rebuilt on the BSC architecture. Tokens, utilities, radii, motion, Header/Footer structure, hero overlap, and even gold-rule geometry are the same system with a palette swap and a display-font swap. A visitor who knows one site will feel déjà vu on the other.",
    evidence:
      "src/index.css @theme radius scale identical (xs 0.125rem … 2xl 0.375rem); shared utilities rise-in, hero-ken-burns, card-lift, gold-rule, bg-grain, bg-adobe-texture; Layout.tsx SHA identical across repos; Header interaction model copied.",
    impact:
      "Brand differentiation is carried almost entirely by typeface, blue hue, and photography. The UX grammar does not express Gothic versus modernist structure.",
    recommendation:
      "Keep the shared primitive layer (good), but give OLL one or two layout signatures that BSC does not have — pointed-arch frames, a vertical chapter rail, or a Tamil/English language toggle — so the monument is not only a recolour.",
    confidence: "verified",
    dimension: "brand-fit",
  },
  {
    siteSlug: "bsc",
    severity: "medium",
    title: "Sacraments are not first-class in navigation",
    description:
      "Baptism, marriage, and anointing are the highest-intent journeys after Mass times. BSC folds them into Worship and FAQ rather than a Sacraments page. Primary nav instead promotes Serve.",
    evidence:
      "src/data/nav.ts primaryNav: Home, About, Worship (Mass / Confession / Find Us), Ministries, News & Events, Serve. No /sacraments route in pages/.",
    impact:
      "A couple preparing for marriage or a parent seeking baptism has to infer the path. Serve is admirable but serves a different job-to-be-done.",
    recommendation:
      "Add a Sacraments page modelled on OLL’s jump nav, or promote the three highest-intent rites into the Worship dropdown.",
    confidence: "verified",
    dimension: "ia",
  },
  {
    siteSlug: "oll",
    severity: "medium",
    title: "No Serve / volunteer conversion path",
    description:
      "The fork dropped BSC’s Serve page and primary-nav item. Giving remains footer-only. A willing newcomer has Ministries (informational) but no “take a place” call.",
    evidence:
      "OLL pages/: Sacraments.tsx exists; Serve.tsx does not. primaryNav ends at News & Events. footerNav includes Give but not Serve.",
    impact:
      "Pastoral inbound is stronger; stewardship inbound is weaker. The household metaphor is less actionable than BSC’s.",
    recommendation:
      "Port Serve (or a shorter “Join a ministry” band) back into primary or footer nav. Keep Sacraments — do not swap one for the other.",
    confidence: "verified",
    dimension: "ia",
  },
  {
    siteSlug: null,
    severity: "medium",
    title: "Client-only SPA: empty first paint, crawler-thin body",
    description:
      "Both ships are Vite + HashRouter single-file SPAs. Static HTML is a shell (<div id=\"root\"></div>) plus excellent head metadata. First contentful paint waits on a large inlined bundle (~470 kB).",
    evidence:
      "Live index.html body contains only #root. JSON-LD, OG, and CSP live in <head>. vite-plugin-singlefile inlines JS+CSS.",
    impact:
      "SEO is rescued by head tags, but assistive tech and slow networks pay a JS tax. Hash URLs (#/worship#mass) are ugly to share and confuse some users.",
    recommendation:
      "Acceptable for parish static hosting. If either site moves to a Node host, SSR the Home and Worship routes. Keep HashRouter only if the host still cannot rewrite.",
    confidence: "verified",
    dimension: "craft",
  },
  {
    siteSlug: "bsc",
    severity: "low",
    title: "Editorial accents are not roof-true",
    description:
      "Terracotta and pine chips (Formation, Archdiocese, Devotion) are handsome and AA-conscious, but they do not come from the building. The roof is sapphire; the gold is sanctuary. The third and fourth hues are magazine.",
    evidence:
      "src/index.css --color-bsc-terracotta-500 #a86545, --color-bsc-pine-500 #2d5a40; categoryTone utilities in the design system.",
    impact:
      "Minor. The page still feels like Queenstown. A stricter identity would let sapphire/gold/cream do more of the work.",
    recommendation:
      "Keep pine/terracotta if category scanning needs four tones; otherwise collapse to sapphire tints plus gold.",
    confidence: "reasoned",
    dimension: "colour",
  },
  {
    siteSlug: "oll",
    severity: "low",
    title: "Gothic architecture is not in the layout geometry",
    description:
      "Radii stay at the shared 2–6px editorial scale “because a gothic survivor keeps the sharp corner” — a good comment. But nothing else in the grid, hero, or cards is pointed, lancet, or triforium. The Emblem SVG is the only Gothic drawing.",
    evidence:
      "src/index.css radius tokens identical to BSC; Emblem.tsx comment “Gothic arch — the grotto niche”; no pointed-arch CSS.",
    impact:
      "Identity leans on type and colour. A visitor skimming cards could be on either parish.",
    recommendation:
      "One structural motif is enough: a lancet crop on PageHero, or a triple-arch footer colonnade. Do not theme every corner.",
    confidence: "reasoned",
    dimension: "layout",
  },
  {
    siteSlug: null,
    severity: "info",
    title: "Shared gold is the right common metal",
    description:
      "Both palettes pin gold-400 to #d4ad42 and gold-700 to #85641c. The metal is sanctuary candlelight, not a brand differentiator. Using the same gold lets the blues carry identity.",
    evidence:
      "bsc-gold-400 and oll-gold-400 both #d4ad42 in src/index.css @theme.",
    impact:
      "Positive. Cross-parish craft stays coherent if the Archdiocese ever wants a family of sites.",
    recommendation:
      "Keep the shared gold. Do not “uniquify” it.",
    confidence: "verified",
    dimension: "colour",
  },
  {
    siteSlug: null,
    severity: "info",
    title: "Accessibility floor is genuinely high on both",
    description:
      "Skip link, visible gold focus, reduced-motion kill-switch, semantic nav landmarks, Escape-to-close, single-open accordion. This is above typical parish-site practice.",
    evidence:
      "src/index.css :focus-visible and prefers-reduced-motion blocks; Header drawer contracts; SkipLink component in both repos.",
    impact:
      "Neither site should be redesigned in a way that drops these contracts.",
    recommendation:
      "Treat the a11y utilities as a locked shared package if more parishes are forked.",
    confidence: "verified",
    dimension: "accessibility",
  },
  {
    siteSlug: "oll",
    severity: "low",
    title: "Younger test harness under-proves the port",
    description:
      "OLL ships 71 unit tests and 31 built e2e versus BSC’s 181 / 67. The missing Header.test.tsx and fewer round-N guard suites mean regressions in drawer a11y or voice/alt contracts are less likely to be caught.",
    evidence:
      "README test tables; GitHub components listing shows Header.tsx without Header.test.tsx on OLL, with Header.test.tsx on BSC.",
    impact:
      "Not a visual defect today. It is how visual defects return tomorrow.",
    recommendation:
      "Port the Header drawer and design-language contract tests when next touching nav.",
    confidence: "verified",
    dimension: "craft",
  },
  {
    siteSlug: "bsc",
    severity: "info",
    title: "Quote card is the best piece of UX writing in the pair",
    description:
      "The overlapping parchment card — “You are not a visitor here. You are expected.” — straddles the hero boundary and does more brand work than the logo. OLL’s grotto line is architectural; BSC’s quote is hospitality.",
    evidence:
      "Home.tsx welcome overlap described in README Key Features; round-19 quote-card e2e.",
    impact:
      "Sets an emotional register that the rest of the sapphire system has to live up to.",
    recommendation:
      "Protect this line. Do not replace it with a generic mission statement.",
    confidence: "reasoned",
    dimension: "voice",
  },
] as const;

export const PALETTE_SEEDS: Record<
  string,
  { token: string; hex: string; usage: string; groupName: string; sortOrder: number }[]
> = {
  bsc: [
    { token: "bsc-cream", hex: "#f8f5ef", usage: "Page background", groupName: "Surface", sortOrder: 1 },
    { token: "bsc-parchment", hex: "#efe8d8", usage: "Section bands, card fills", groupName: "Surface", sortOrder: 2 },
    { token: "bsc-parchment-dark", hex: "#e3d8c2", usage: "Dark parchment variant", groupName: "Surface", sortOrder: 3 },
    { token: "bsc-stone", hex: "#d4c9ae", usage: "Borders, weave dividers", groupName: "Surface", sortOrder: 4 },
    { token: "bsc-ink", hex: "#1e2330", usage: "Primary text", groupName: "Ink", sortOrder: 5 },
    { token: "bsc-charcoal", hex: "#3a3f4d", usage: "Secondary text", groupName: "Ink", sortOrder: 6 },
    { token: "bsc-sapphire-50", hex: "#eef2fb", usage: "Ghost hover", groupName: "Sapphire", sortOrder: 7 },
    { token: "bsc-sapphire-300", hex: "#7a9bdb", usage: "Eyebrow on dark", groupName: "Sapphire", sortOrder: 8 },
    { token: "bsc-sapphire-500", hex: "#3458a8", usage: "Links, primary sapphire", groupName: "Sapphire", sortOrder: 9 },
    { token: "bsc-sapphire-700", hex: "#1f366e", usage: "Display heading", groupName: "Sapphire", sortOrder: 10 },
    { token: "bsc-sapphire-900", hex: "#0f1a33", usage: "Hero + footer", groupName: "Sapphire", sortOrder: 11 },
    { token: "bsc-sapphire-950", hex: "#0a1122", usage: "Deepest sapphire, theme-color", groupName: "Sapphire", sortOrder: 12 },
    { token: "bsc-gold-300", hex: "#dfc06a", usage: "Gold highlight", groupName: "Gold", sortOrder: 13 },
    { token: "bsc-gold-400", hex: "#d4ad42", usage: "Rules, focus ring, CTAs", groupName: "Gold", sortOrder: 14 },
    { token: "bsc-gold-600", hex: "#a67f22", usage: "Gold hover", groupName: "Gold", sortOrder: 15 },
    { token: "bsc-gold-700", hex: "#85641c", usage: "Text on parchment", groupName: "Gold", sortOrder: 16 },
    { token: "bsc-pine-500", hex: "#2d5a40", usage: "Formation chip", groupName: "Accent", sortOrder: 17 },
    { token: "bsc-terracotta-500", hex: "#a86545", usage: "Devotion chip", groupName: "Accent", sortOrder: 18 },
  ],
  oll: [
    { token: "oll-cream", hex: "#f8f5ef", usage: "Page background", groupName: "Surface", sortOrder: 1 },
    { token: "oll-parchment", hex: "#efe9da", usage: "Section bands", groupName: "Surface", sortOrder: 2 },
    { token: "oll-parchment-dark", hex: "#e3dac4", usage: "Dark parchment", groupName: "Surface", sortOrder: 3 },
    { token: "oll-stone", hex: "#d5cab1", usage: "Borders, weave", groupName: "Surface", sortOrder: 4 },
    { token: "oll-ink", hex: "#1d2230", usage: "Primary text", groupName: "Ink", sortOrder: 5 },
    { token: "oll-charcoal", hex: "#3b4150", usage: "Secondary text", groupName: "Ink", sortOrder: 6 },
    { token: "oll-blue-50", hex: "#eef3fc", usage: "Ghost hover", groupName: "Marian blue", sortOrder: 7 },
    { token: "oll-blue-300", hex: "#7f9fde", usage: "Eyebrow on dark", groupName: "Marian blue", sortOrder: 8 },
    { token: "oll-blue-600", hex: "#2c4a8e", usage: "Links, primary", groupName: "Marian blue", sortOrder: 9 },
    { token: "oll-blue-700", hex: "#233a71", usage: "Display heading", groupName: "Marian blue", sortOrder: 10 },
    { token: "oll-blue-900", hex: "#121e3c", usage: "Hero + footer", groupName: "Marian blue", sortOrder: 11 },
    { token: "oll-blue-950", hex: "#0a1428", usage: "Deepest Marian, theme-color", groupName: "Marian blue", sortOrder: 12 },
    { token: "oll-gold-300", hex: "#dfc06a", usage: "Gold highlight", groupName: "Gold", sortOrder: 13 },
    { token: "oll-gold-400", hex: "#d4ad42", usage: "Rules, focus ring, CTAs", groupName: "Gold", sortOrder: 14 },
    { token: "oll-gold-600", hex: "#a67f22", usage: "Gold hover", groupName: "Gold", sortOrder: 15 },
    { token: "oll-gold-700", hex: "#85641c", usage: "Text on parchment", groupName: "Gold", sortOrder: 16 },
    { token: "oll-rose-600", hex: "#8a4a5f", usage: "Mystical Rose accent", groupName: "Accent", sortOrder: 17 },
    { token: "oll-sage-600", hex: "#2f4f37", usage: "Formation accent", groupName: "Accent", sortOrder: 18 },
  ],
};

export const METHOD_NOTES = {
  liveShell:
    "Both live hosts are client-rendered SPAs. Fetching the URL returns a document whose visible body is an empty #root. Visual claims below are therefore from source CSS, tokens, components, READMEs, and an existing OLL design-audit extract — not from a painted screenshot of the running React tree.",
  confidence:
    "Tokens, typefaces, nav, page inventory, motion utilities, and a11y CSS: Verified in source. Rendered hero photography and micro-spacing: Reasoned from CSS + README. Live hover feel: Unverifiable in this pass because the SPA shell does not SSR.",
} as const;
