# Adidas Outfit Creator
## MVP Product & Technical Specification

**Version:** 1.3 (adds typed categories, explicit recommendation rules, testing strategy; see `DEVELOPMENT-TDD-GUIDE.md`)  
**Product type:** Responsive web application  
**Delivery approach:** Local development → GitHub → Vercel  
**Target build time:** 60-minute vibe-coding workshop

---

## 1. Product Vision

Adidas Outfit Creator is an interactive web application that helps customers create a complete Adidas outfit based on their activity, weather conditions and personal style preferences.

Users select what they plan to do, choose the expected weather and select a preferred style. The application generates a coordinated outfit using a predefined product catalogue. Users can then customise the generated outfit by replacing individual items without regenerating the entire selection.

**Product value proposition:**

> Build your perfect Adidas look in seconds.

## 2. Target Users

Primary users:

- Sports enthusiasts looking for appropriate sportswear.
- Customers looking for inspiration when purchasing sports apparel.
- People looking for coordinated outfits for different occasions.

## 3. Core User Journey

1. User opens Adidas Outfit Creator.
2. User selects an activity.
3. User selects weather conditions.
4. User chooses a preferred style.
5. User clicks **Create My Outfit**.
6. The application generates a complete outfit.
7. User reviews the recommended products.
8. User can replace individual items.
9. User sees the updated outfit and total estimated price.

## 4. Functional Requirements

### FR-01: Activity Selection

The user must be able to select one of four activities.

| Activity | Description | Required outfit items |
|---|---|---|
| Running | Running and outdoor training | Running shoes, top, bottoms |
| Gym | Indoor fitness and strength training | Training shoes, top, bottoms |
| Football | Football training and playing | Football footwear, top, shorts, socks |
| Casual | Everyday lifestyle | Shoes, top, bottoms |

The selected activity determines which product categories are included in the outfit. Additional layers and accessories can be included where relevant.

**Category model (slots).** Products and outfit items use a fixed set of slots: `shoes`, `top`, `bottom`, `socks`, `jacket`, `accessory`. Mapping of the table above:

- "Running shoes", "Training shoes", "Football footwear" and "Shoes" are all the `shoes` slot, differentiated by each product's `activities`.
- "Bottoms" and "Shorts" are the `bottom` slot.
- Mandatory slots: Running, Gym, Casual = `shoes`, `top`, `bottom`. Football = `shoes`, `top`, `bottom`, `socks`.
- `jacket` and `accessory` are optional slots (see FR-02 and FR-04).

### FR-02: Weather Selection

The user must be able to select one of four predefined weather profiles:

- **Hot & sunny:** 20°C+
- **Mild & dry:** 12–19°C
- **Cold & dry:** below 12°C
- **Wet & rainy**

Weather selection should influence product recommendations.

Examples:

- Hot weather: lightweight T-shirts and shorts.
- Mild weather: standard sportswear.
- Cold weather: long sleeves, tights and jackets.
- Rainy weather: appropriate outer layers and weather-resistant products.

These are recommendation guidelines rather than strict temperature rules.

**Optional layer rule.** A `jacket` is added when the weather is **Cold & dry** or **Wet & rainy** and a compatible jacket exists in the catalogue. A jacket is never added for **Hot & sunny**, and is not added by default for **Mild & dry**. If no compatible jacket exists, the outfit is still valid without one.

### FR-03: Style Selection

The user must be able to choose one of four styles:

- **Performance:** functional sportswear focused on training.
- **Minimal:** clean designs and neutral colours.
- **Bold:** expressive colours and distinctive designs.
- **Streetwear:** contemporary lifestyle and oversized looks.

Style preference must influence the products selected.

### FR-04: Outfit Generation

When the user clicks **Create My Outfit**, the system generates a complete outfit.

The generated outfit must:

- Contain all mandatory categories for the selected activity.
- Reflect the selected weather profile.
- Reflect the selected style.
- Use only products available in the predefined catalogue.
- Avoid duplicate product selections (the same product never appears twice in one outfit).
- Display product information and estimated prices.
- Add at most one `accessory`, and only if a compatible one scores at least 4 points (see section 8).
- If a mandatory slot cannot be filled from the catalogue, show a friendly error state instead of a partial outfit.

The application should also provide a short explanation of why the outfit was generated.

Example:

> Your performance running outfit is designed for mild weather. It combines breathable apparel, comfortable running footwear and lightweight layers.

### FR-05: Individual Product Replacement

Users must be able to replace individual products within the generated outfit. Each product card should include a **Change item** action.

When selected:

- Display alternative products from the same category.
- Show product image, name and price.
- Allow the user to select a replacement.
- Update the outfit immediately.
- Recalculate the total price.

Replacing one product must not change the other products in the outfit.

Alternative products should respect the user's selected activity, weather and style wherever possible. If no matching alternative exists, show a friendly message rather than an empty result.

Alternatives rules:

- Same slot only; activity compatibility is mandatory.
- Exclude the currently selected product and any product already in the outfit.
- Sort by recommendation score (highest first), then by price (lowest first).
- The recommendation explanation describes the preferences, not specific products, so it is not regenerated after a replacement.

### FR-06: Regenerate Outfit

Provide a **Generate Another Look** action. This generates a different combination using the same preferences.

The application should avoid returning exactly the same combination when suitable alternatives exist. The generator receives the current outfit as an exclusion and makes a bounded number of attempts (10) to produce a different one. If the catalogue offers no different combination, the same outfit is kept and a friendly note is shown.

### FR-07: Outfit Summary

Display:

- Selected activity.
- Selected weather.
- Selected style.
- All selected products.
- Individual product prices.
- Total estimated outfit price.

Use PLN as the demo currency. Prices are stored as integers in grosz (`priceMinor`) to avoid floating-point errors, and formatted for display with `Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" })`. Prices are illustrative sample data, not live Adidas store prices, unless an approved catalogue provides current prices and permission to use them.

## 5. User Interface Requirements

### Screen 1: Landing Page / Outfit Configuration

The landing page should have a modern, Adidas-inspired visual identity.

Suggested headline:

> Create Your Perfect Look.

Subheading:

> Tell us where you're going, what the weather looks like and how you want to look. We'll create your outfit.

Configuration sections:

**A. Select your activity**

Four selectable visual cards:

- Running
- Gym
- Football
- Casual

**B. Select the weather**

Four selectable weather cards with appropriate icons.

**C. Choose your style**

Four visual style cards with representative imagery or colour treatments.

**D. Generate**

A prominent **Create My Outfit** button. It is **disabled until an activity, a weather profile and a style are all selected**, with helper text explaining what is missing.

The user should be able to change selections before generating.

Selector cards are implemented as accessible radio groups (one per section) with a visible selected state and keyboard support.

### Screen 2: Generated Outfit

Display the generated outfit in a visually engaging layout.

Suggested structure:

- Header: **Your Outfit Is Ready!**
- Short recommendation explanation.
- Product cards arranged in a responsive grid.
- Each card includes:
  - Product image.
  - Product name.
  - Category.
  - Colour.
  - Price.
  - **Change item** button.
- Total outfit price.
- **Generate Another Look** button.
- **Back to Preferences** button.

The outfit should feel like a premium sportswear shopping experience, not a generic admin dashboard.

### Screen 3: Product Replacement

When the user clicks **Change item**:

- Open a modal or side panel.
- Display alternative products in the same category.
- Show image, product name and price.
- Allow selection of one alternative.
- Close the panel after selection.
- Immediately update the outfit.
- Behave as an accessible dialog: focus moves into the panel on open, Escape closes it, and focus returns to the **Change item** button on close.

## 6. Visual Design & Adidas Brand Direction

### Design Objective

Use the official Adidas website as a visual reference for the application's design language:

https://www.adidas.com/

The objective is to create a familiar, premium sportswear shopping experience that feels consistent with the Adidas digital ecosystem. The implementation should follow the visual direction below without attempting to reproduce the entire Adidas website.

### 6.1 Colour Palette

Use a predominantly monochrome design.

| Element | Suggested colour | Hex |
|---|---|---|
| Primary background | White | `#FFFFFF` |
| Primary text | Black | `#000000` |
| Primary buttons | Black | `#000000` |
| Button text | White | `#FFFFFF` |
| Secondary background | Light grey | `#F5F5F5` |
| Borders | Neutral grey | `#E5E5E5` |
| Secondary text | Dark grey | `#666666` |

Product images may introduce additional colours naturally. Avoid unnecessary gradients, colourful backgrounds or decorative effects.

### 6.2 Typography

Use a clean, bold, modern sans-serif typography style.

Design recommendations:

- Large, bold headlines.
- Clear visual hierarchy.
- Strong product names and pricing.
- Readable body text.
- Uppercase typography for selected short labels and buttons.

Suggested fonts:

- Barlow or Barlow Condensed for headings.
- A clean sans-serif font such as Inter or Arial for body text.

Use freely available fonts rather than importing proprietary Adidas typefaces without permission.

### 6.3 Layout and Components

Follow these design principles:

- Generous whitespace.
- Large product photography.
- Clean grid layouts.
- Minimal unnecessary borders and shadows.
- Strong alignment and spacing.
- Product-focused cards.
- Large, easily identifiable actions.
- Simple and intuitive navigation.

The overall layout should prioritise product imagery rather than long descriptions.

### 6.4 Buttons and Interactions

**Primary buttons:**

- Black background.
- White text.
- Bold typography.
- Slightly rounded or square corners.
- Clear hover and focus states.

**Secondary buttons:**

- White or transparent background.
- Black text.
- Black border.

Selected activity, weather and style cards should have a clearly visible selection state using borders or background contrast.

### 6.5 Product Photography

Product photography is one of the most important elements of the experience.

Use:

- High-quality product images.
- Consistent image proportions.
- Clear product presentation.
- Lifestyle and sports photography for activity/style selection.
- Neutral backgrounds where suitable.

Product imagery should remain the focal point of the outfit builder.

### 6.6 Branding and Asset Guidelines

For the workshop prototype:

- Use Adidas logo assets supplied or authorised by Adidas.
- Use approved Adidas product imagery where available.
- Do not distort or recreate the Adidas logo.
- Do not download and redistribute protected website assets without permission.
- Avoid copying the exact Adidas website structure or complete page layout.
- Use mock product information when approved product data is unavailable.

If authorised assets are unavailable, use clearly identified placeholders and keep the application visually Adidas-inspired. The prototype should be presented as a workshop concept, not an officially released Adidas shopping product. A visible footer note states: "Workshop concept – not an official Adidas product. Prices are illustrative." The asset approval question (logo, imagery) must be resolved before the workshop; if it is still open, use the placeholder fallback.

## 7. Product Catalogue and Data Model

### 7.1 Catalogue Source

For the MVP, use a predefined local product catalogue. No external Adidas API or e-commerce integration is required.

**Preferred approach:** ask the Adidas team to provide a small approved product catalogue, ideally 20–30 products, in CSV, Excel or JSON format, together with approved product images.

Suggested catalogue coverage:

- 6 footwear products.
- 8 tops.
- 6 bottoms.
- 3 socks (at least 2 football-compatible).
- 3 jackets or additional layers (covering cold and rainy).
- 2–3 accessories.

(About 28–29 products in total.) The mix can be adjusted, but it must satisfy these **catalogue integrity rules**, which are enforced by automated tests:

- Every mandatory slot of every activity has at least 3 compatible products (one selected plus at least two alternatives).
- For each activity and slot, every style has at least one matching product, so the style choice always has an effect.
- Every product has unique id, image file present in `public/products/`, positive integer price, and at least one activity, weather tag and style tag.
- At least one compatible jacket exists for each of the cold and rainy profiles.

Recommended fields:

| Field | Example / purpose |
|---|---|
| Product ID | Unique product identifier |
| Product name | Product display name |
| Model / SKU | Adidas model or product identifier, if supplied |
| Category | Shoes, top, bottoms, jacket, socks, accessory |
| Image | Approved local image filename or asset reference |
| Price | Price in PLN, if approved for demo use |
| Colour | Product colour |
| Activities | Compatible activities |
| Weather tags | Compatible weather profiles |
| Style tags | Compatible styles |
| Description | Short product description |
| Product URL | Official product page, if approved for inclusion |

### 7.2 Product Data Acquisition and Website Parsing

Automated scraping of the Adidas website is **not part of the MVP** and should not be implemented without explicit permission from Adidas.

Reasons:

- Automated access may be restricted by website terms.
- Product pages and page structures can change.
- Product variants, regional prices, image delivery and availability can complicate extraction.
- Product descriptions and images may be protected content and may not be reusable in another application without authorisation.
- A scraper would add unnecessary development and maintenance effort to a 60-minute workshop.

Preferred options, in order:

1. **Adidas-provided catalogue:** use approved product data and images supplied by the team.
2. **Manually curated catalogue:** select a small set of products and enter approved details manually.
3. **Mock catalogue:** use realistic sample product records and clearly identified placeholder imagery if approved assets are unavailable.

Do not build a runtime scraper or rely on the public website as an undocumented product API.

### 7.3 Local Storage of Catalogue Assets

Store the catalogue locally, preferably in:

`/src/data/products.ts`

Store product images under:

`/public/products/`

Use approved Adidas product imagery supplied for the demo, or clearly identified placeholder imagery. Do not rely on external image URLs or live product feeds.

### 7.4 Suggested TypeScript Interface

```typescript
type Activity = "running" | "gym" | "football" | "casual";

type Weather = "hot" | "mild" | "cold" | "rainy";

type Style = "performance" | "minimal" | "bold" | "streetwear";

type Slot = "shoes" | "top" | "bottom" | "socks" | "jacket" | "accessory";

interface Product {
  id: string;
  name: string;
  category: Slot;
  image: string;
  priceMinor: number; // integer grosz, e.g. 34999 = 349.99 PLN
  currency: "PLN";
  color: string;
  activities: Activity[];
  weatherTags: Weather[];
  styleTags: Style[];
  description: string;
  productUrl?: string;
}
```

## 8. Outfit Recommendation Logic

The MVP does not require an AI model or external recommendation API. Implement a simple rule-based recommendation engine.

The engine should:

1. Identify the required categories for the selected activity.
2. Filter products by activity compatibility.
3. Score products based on weather compatibility.
4. Score products based on style compatibility.
5. Select the best matching products.
6. Return one product per required category.
7. Add optional layers or accessories when appropriate and available.

Suggested scoring model:

- Activity compatibility: mandatory.
- Weather match: +3 points.
- Style match: +3 points.
- Additional colour coordination: +1 point.

Use the highest-scoring suitable products, with some controlled variation when generating another outfit. Never select a product that is incompatible with the selected activity.

**Precise rules:**

- Activity is a hard filter. Weather and style are scoring only, so an outfit can always be built. Maximum score is 7.
- Colour coordination (+1): the product colour is neutral (black, white, grey) or equals the colour of an already-picked item. Items are picked in a fixed order: shoes, top, bottom, socks, jacket, accessory.
- Controlled variation: pick randomly, weighted by score, among the top 3 candidates per slot. The random number generator is **injectable** (default `Math.random`) so tests can use a seeded one.
- Generating another look passes the current outfit as an exclusion (see FR-06).
- Engine API (pure functions, no React, no hidden randomness): `getRequiredSlots`, `scoreProduct`, `generateOutfit`, `getAlternatives`, `replaceItem`, `calculateTotal`, `buildExplanation`. Signatures are in `DEVELOPMENT-TDD-GUIDE.md`.

The recommendation engine should be isolated in a separate module so that a future AI-based recommendation service could replace it without redesigning the UI.

## 9. Technical Architecture

### Recommended Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| UI | React |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Product catalogue | Local TypeScript/JSON data |
| State management | React `useReducer` (pure, separately testable reducer) |
| Testing | Vitest, React Testing Library, vitest-axe, Playwright (see `DEVELOPMENT-TDD-GUIDE.md`) |
| Hosting | Vercel |
| Version control | GitHub |

Use the Next.js App Router.

### Architecture Principles

Keep the solution simple and modular. Suggested project structure:

```text
adidas-outfit-creator/
│
├── public/
│   └── products/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ActivitySelector.tsx
│   │   ├── WeatherSelector.tsx
│   │   ├── StyleSelector.tsx
│   │   ├── OutfitDisplay.tsx
│   │   ├── ProductCard.tsx
│   │   └── ProductReplacement.tsx
│   │
│   ├── data/
│   │   └── products.ts
│   │
│   ├── lib/
│   │   ├── outfitGenerator.ts
│   │   ├── outfitReducer.ts
│   │   └── format.ts          (tests live next to each file as *.test.ts)
│   │
│   └── types/
│       └── index.ts
│
├── package.json
└── README.md
```

Keep the application frontend-only for the MVP. No database, authentication, API layer or server-side AI integration is necessary.

## 10. Local Development Requirements

The application must first be runnable locally.

Prerequisites:

- Node.js version supported by the selected Next.js release.
- npm.
- Git.
- A code editor and AI coding assistant.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Expected local URL: `http://localhost:3000`

Build the production version locally:

```bash
npm run build
```

Run the production build locally:

```bash
npm run start
```

The application must work without any external service credentials or environment variables.

## 11. Vercel Deployment Requirements

The solution must be deployable to Vercel without architectural changes.

Deployment approach:

1. Create a GitHub repository.
2. Commit and push the application source code.
3. Connect the GitHub repository to Vercel.
4. Allow Vercel to detect Next.js automatically.
5. Use the standard build command: `npm run build`.
6. Deploy the application.
7. Validate the deployed URL.

Expected environments:

- **Local:** application running on the developer's machine.
- **Preview:** Vercel deployment for testing and review.
- **Production:** published application.

No environment variables are required for the MVP. All product data and images must be included in the repository so that the Vercel deployment works independently of the developer's local machine.

## 12. Non-Functional Requirements

### Performance

- Fast initial page load.
- Optimised local product images.
- No unnecessary external API requests.

### Responsiveness

- Support desktop, tablet and mobile layouts.
- Maintain usable product cards on smaller screens.

### Usability

- Clear selection states.
- Responsive buttons and interactions.
- Loading or transition feedback when generating outfits.
- Friendly messages for unavailable alternatives.

### Accessibility

- Keyboard-accessible controls.
- Appropriate image alt text.
- Sufficient colour contrast.
- Clear focus indicators.

### Maintainability

- Separation of UI components, product data and recommendation logic.
- Type-safe application code.
- No unnecessary architectural complexity.

## 13. Acceptance Criteria

The MVP is considered complete when:

1. The application starts successfully on a local machine.
2. The user can select all four activity types.
3. The user can select all four weather profiles.
4. The user can select all four style preferences.
5. The application generates a complete outfit based on the selections.
6. Required product categories change depending on the selected activity.
7. Products are displayed with images, names and prices.
8. Users can replace individual items.
9. Replacing one item does not modify the remaining outfit.
10. Users can generate another outfit.
11. The total outfit price is recalculated correctly.
12. The application is responsive.
13. The Adidas-inspired design direction is implemented consistently.
14. `npm run build` completes successfully.
15. The application can be deployed and accessed through a Vercel URL.
16. All 64 combinations of activity, weather and style produce a complete, activity-compatible outfit with no duplicate products (automated matrix test).
17. The catalogue passes the integrity rules in section 7.1.
18. `npm run verify` (lint, type check, tests with coverage thresholds, build) passes. Coverage: `src/lib` 100% statements and at least 95% branches; overall at least 85% statements and 80% branches.
19. Selectors, the replacement dialog and each screen are keyboard-operable and have no automated accessibility violations.
20. "Create My Outfit" is disabled until all three selections are made.

Criterion 13 (design consistency) is verified by a manual checklist against the design tokens defined in `globals.css`. The traceability of each criterion to its tests is in `DEVELOPMENT-TDD-GUIDE.md`.

## 14. Out of Scope

The following functionality and integrations are explicitly excluded from the 60-minute MVP.

### Product and E-commerce Integrations

- Live Adidas product catalogue integration.
- Automated scraping or crawling of Adidas websites.
- Real-time inventory and availability.
- Product size and availability recommendations.
- Direct integration with the Adidas shopping cart.
- Checkout and payment processing.
- Order management and delivery tracking.
- Product purchasing through the application.

### AI and Personalisation

- LLM-based outfit recommendations.
- AI-generated outfit images.
- Virtual try-on.
- Body measurements or body-shape recommendations.
- Advanced personalisation based on previous purchases.
- Customer preference learning.

### User Management and Data

- Customer accounts and authentication.
- User profiles.
- Saved outfits and favourites.
- Preference persistence across sessions.
- Database integration.
- User activity history.

### External Integrations

- Live weather API.
- Adidas membership or adiClub integration.
- Social media sharing integrations.
- Marketing and analytics integrations.
- CRM integrations.

### Enterprise and Production Readiness

- Production security architecture.
- Enterprise authentication and authorisation.
- Advanced monitoring and observability.
- Formal performance and load testing.
- Production support and operational processes.
- Full brand approval and production asset licensing.

**Out-of-scope principle:** If functionality requires external credentials, complex integrations, a backend, additional infrastructure or significant additional testing, it should not be included in this workshop MVP.

## 15. Potential Future Enhancements

Once the MVP is working, the product could evolve to include:

1. AI-powered stylist that explains and personalises recommendations.
2. Approved Adidas product catalogue integration or an official product API, if made available.
3. Product availability and size checking.
4. Save and share your outfit.
5. Virtual try-on or AI-generated outfit visualisation.
6. Budget-based outfit generation.
7. Location-aware weather recommendations.
8. Direct integration with the Adidas shopping experience.
9. Personalised suggestions based on user preferences and purchase history.

## 16. Workshop Execution Plan – 60 Minutes

| Time | Activity | Expected outcome |
|---|---|---|
| 00–05 min | Introduce the business problem | Shared understanding of the product |
| 05–15 min | Generate and refine the specification | Agreed MVP requirements |
| 15–18 min | Review scope and out-of-scope items | Clear boundaries for the prototype |
| 18–23 min | Generate technical implementation plan | Initial architecture and coding tasks |
| 23–43 min | Vibe coding | Working application and core interactions |
| 43–50 min | Testing and refinement | Validated main user journey |
| 50–57 min | GitHub and Vercel deployment | Published preview, subject to deployment readiness |
| 57–60 min | Demo and reflection | End-to-end demonstration and lessons learned |

The 23–43 min block assumes the project scaffold, test tooling and catalogue (with passing integrity tests) are prepared **before** the workshop. In-workshop priority if time runs short: engine and catalogue tests first; component tests next; accessibility and E2E tests last.

Deployment is a stretch goal if coding or debugging takes longer than expected. A working local application is the minimum successful outcome.

## 17. Pre-Workshop Preparation

To protect the 60-minute build window, prepare the following in advance:

- Confirm the coding assistant and local development environment are installed and working.
- Prepare a blank Next.js project or starter repository, with Vitest, Testing Library, Playwright and the `npm run verify` script already configured and one passing test.
- Complete the product catalogue and make the catalogue integrity tests pass (including socks and jackets).
- Confirm GitHub access and create the repository if appropriate.
- Create or prepare the Vercel project so deployment setup does not consume workshop time.
- Ask Adidas for an approved sample catalogue of approximately 20–30 products, with product attributes and images.
- Confirm whether the Adidas logo, product images and brand guidelines may be used in the prototype.
- If approved assets are unavailable, prepare clearly identified placeholder products and images.

Suggested request to the Adidas team:

> Would it be possible to provide a small set of approved Adidas product data and product images (approximately 20–30 items) that we could use for a workshop prototype? A CSV, Excel or JSON export would be sufficient. We would also appreciate any brand guidelines or approved logo assets that can be used for the demo.

Product catalogue preparation should be a pre-workshop activity, not part of the 60-minute coding exercise.

## 18. Definition of Success for the Workshop

The workshop is successful when participants can see a complete journey from a written business specification to a working, locally running web application and, ideally, a deployed Vercel version.

The final demonstration should show:

- An initial product specification.
- AI-assisted refinement of requirements.
- Explicit MVP and out-of-scope decisions.
- AI-generated application code.
- A functioning outfit configuration experience.
- Generated product recommendations.
- Interactive product replacement.
- Adidas-inspired visual styling.
- Local execution.
- Successful deployment to Vercel, where time permits.

**The main objective is not to build a production-ready Adidas product. It is to demonstrate how quickly an idea can be transformed into a tangible, testable product prototype using vibe coding.**
