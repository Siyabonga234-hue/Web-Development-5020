# Sithole Agriculture & LiveStocks — Website

**Part 2 features**

- External stylesheet linked to all five pages
- Earthy green / terracotta / cream colour scheme applied through CSS custom properties
- Serif heading and sans-serif body typography on a 1.2 modular type scale
- CSS Grid card and panel layouts; Flexbox header, media sections and forms
- Interactive `:hover`, `:focus` and `:active` states on links, buttons, cards and form fields
- Responsive design at three breakpoints with responsive images via `srcset` / `sizes`
- Accessibility: skip link, visible focus outlines, `prefers-reduced-motion` support

## File and Folder Structure
sithole-agriculture-website/
index.html
about.html
products.html
enquiry.html
contact.html
README.md

css/
style.css
js/
script.js          (placeholder populated in Part 3)
images/
corn-harvest-hero.jpg      + 360w / 540w / 720w variants
corn-harvest.jpg           + 360w / 540w / 720w variants
esibayeni-kraal.jpg        + 360w / 540w / 720w variants
cattle-herd.jpg            + 360w / 540w / 720w variants
cattle-grazing.jpg         + 360w / 540w / 720w variants
potato-rows.jpg            + 360w / 540w / 720w variants
potatoes.jpg               + 360w / 540w variants
docs/
screenshots/       (responsive testing evidence)
Document/
Sithole_Agriculture_LiveStocks_Website_Proposal.docx


## Part 1 Details

Part 1 established the foundation of the website:

- Selected and researched the target organisation, and produced two Website Project
  Proposals for lecturer approval.
- Sourced original photography of the farm's cattle, kraal, maize and potato crops.
- Created the folder structure (`css`, `js`, `images`) and the five HTML pages.
- Built the semantic HTML structure using `header`, `nav`, `main`, `section`,
  `article` and `footer`.
- Linked all pages together through a shared navigation menu.

## Part 2 Details

### 2.1 External Stylesheet

A single external stylesheet, `css/style.css`, is linked from the `<head>` of all five
pages. All styling lives in this one file — there are no inline `style` attributes and
no embedded `<style>` blocks anywhere in the project.

### 2.2 Base Style and CSS Reset

The stylesheet opens with a reset that normalises `box-sizing`, strips default margins
and padding, and standardises list, image, form and link defaults so the design starts
from the same baseline in Chrome, Firefox, Edge and Safari.

Base styles then set the site-wide font family, font size, line height, text colour and
background colour.

### 2.3 Typography

| Property | Application |
|---|---|
| `font-family` | Georgia serif stack for headings; Segoe UI sans-serif stack for body |
| `font-size` | Seven-step modular scale (`--text-sm` through `--text-4xl`) |
| `font-weight` | 600 for emphasis and labels, 700 for headings |
| `line-height` | 1.2 for headings, 1.6 for body copy |
| `letter-spacing` | Tightened on headings, widened on uppercase navigation and labels |

The type scale uses a 1.2 "minor third" ratio, so each step is 1.2× the one below it
rather than being chosen arbitrarily.

### 2.4 Layout Structure

- **CSS Grid** the three-column "What We Do" cards, the Mission/Vision panels, the
  two location cards, the map pair, and the hero (using `grid-template-areas` to stack
  the heading over the photograph in a single named grid cell).
- **Flexbox** the site header (`justify-content: space-between`), the navigation list,
  the alternating image-and-text media sections (`flex-direction: row-reverse` on
  alternate rows), the form rows, and the sticky-footer body column.

### 2.5 Visual Styles

`color`, `background-color`, `border` and `box-shadow` are used throughout. Interactive
elements respond through pseudo-classes:

| Element | `:hover` | `:focus` | `:active` |
|---|---|---|---|
| Navigation links | Green background | Cream outline | Terracotta background |
| CTA buttons | Darker terracotta, lifts 2px | Green outline | Returns to resting position |
| Text links | Darker terracotta, underline appears | Green outline | Dark green |
| Cards | Lifts 4px, deeper shadow 
| Form fields | Green border | Green border with focus ring 

### 3.1 Breakpoints

| Breakpoint | Width | Changes |
|---|---|---|
| Desktop | Above 1024px | Three-column cards, two-column panels, side-by-side media sections |
| Tablet | 1024px and below | Cards drop to two columns, maps stack, headings step down, nav text shrinks |
| Mobile | 640px and below | Everything single-column, nav wraps and centres, images stack above text, buttons full-width |

### 3.2 Relative Units

`rem` is used for the entire type and spacing scale so the layout scales with the user's
browser font-size setting. `ch` sets the reading line length on paragraphs, `%` and
`vw` handle fluid widths, and `em` governs positioning that should follow local font size.
Fixed pixel values are used only for hairline borders and breakpoint definitions.

### 3.3 Responsive Images

Each content photograph is served at three resolutions (360w, 540w, 720w) through the
`srcset` attribute, with `sizes` telling the browser how much layout width the image will
occupy at each breakpoint. The browser then downloads only the resolution it needs,
which keeps mobile data usage down.

### 3.4 Test and Iterate

The site was tested at desktop, tablet and mobile viewport sizes using browser developer
tools. Screenshot evidence is in `docs/screenshots/` and indexed below.

---

## Responsive Testing Evidence

Rendered in Chromium at three device viewport sizes.

| Page | Desktop (1440×900) | Tablet (834×1112) | Mobile (390×844) |
|---|---|---|---|
| Home | `index-desktop.png` | `index-tablet.png` | `index-mobile.png` |
| About Us | `about-desktop.png` | `about-tablet.png` | `about-mobile.png` |
| Livestock & Crops | `products-desktop.png` | `products-tablet.png` | `products-mobile.png` |
| Enquire | `enquiry-desktop.png` | `enquiry-tablet.png` | `enquiry-mobile.png` |
| Contact | `contact-desktop.png` | `contact-tablet.png` | `contact-mobile.png` |

All files are in `docs/screenshots/`.

### Home page across all three breakpoints

| Desktop | Tablet | Mobile |
|---|---|---|
| ![Home on desktop](docs/screenshots/index-desktop.png) | ![Home on tablet](docs/screenshots/index-tablet.png) | ![Home on mobile](docs/screenshots/index-mobile.png) |

---

## Changelog

### Part 2 — CSS Styling and Responsive Design

**Corrections carried over from Part 1**

- **Restored missing `js/` folder.** All five pages referenced `js/script.js`, but the
  folder was absent from the submitted repository, producing a broken request on every
  page load. The folder and placeholder file have been restored.
- **Removed inline `style` attributes.** `contact.html` and `enquiry.html` each carried
  a `style="background-image: ..."` attribute on the `<body>` tag. These conflicted with
  the Part 2 requirement for an external stylesheet and used an invalid escape sequence
  for the filename. The background is now the `.has-page-background--corn` class in
  `style.css`.
- **Added `alt` text to all images.** Four images across the Home, About and Livestock &
  Crops pages had no `alt` attribute, which is both an accessibility failure and an SEO
  issue ahead of Part 3.
- **Restored the map on the Contact page.** Part 1 required contact information, a map
  and a contact form. The map had been removed; embedded Google Maps for both the
  Limehill and Bergville locations have been reinstated.
- **Renamed image files to web-safe names.** Filenames containing spaces
  (`Corn havesting 1.1.jpeg`) were the cause of the invalid background-image escape.
  All images now use lowercase hyphenated names.
- **Removed presentational `<b>` tags** from the About page body copy. Emphasis is now
  handled in CSS, in line with separating content from presentation.
- **Cleaned placeholder brackets** from the Contact page — real contact details were
  entered in Part 1 but the surrounding `[ ]` markers were left in place.

**New in Part 2**

- Created the full external stylesheet (`css/style.css`), replacing the 15-line Part 1
  placeholder.
- Added a CSS reset for cross-browser consistency.
- Introduced CSS custom properties for the complete colour scheme, type scale and
  spacing scale.
- Applied the earthy green / terracotta / cream palette specified in the approved
  Website Project Proposal.
- Implemented serif/sans-serif typography on a 1.2 modular scale.
- Built the desktop layout using CSS Grid (cards, panels, hero) and Flexbox (header,
  media sections, forms).
- Added `:hover`, `:focus` and `:active` states across navigation, buttons, links, cards
  and form fields.
- Added tablet (≤1024px) and mobile (≤640px) breakpoints with media queries.
- Generated 360w / 540w / 720w variants of every photograph and wired them up with
  `srcset` and `sizes`.
- Added a skip-to-content link, visible focus outlines and `prefers-reduced-motion`
  support for accessibility.
- Added a print stylesheet.
- Captured responsive testing screenshots at three viewport sizes.

### Part 1 — Building the Foundation

- Created the project folder structure (`css`, `js`, `images`).
- Built five HTML pages with semantic structure and a shared navigation menu.
- Integrated researched content and original farm photography.
- Produced the Website Project Proposal for lecturer approval.

---

## References

MDN Web Docs, 2026. *CSS grid layout.* [Online] Available at:
https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout
[Accessed 16 September 2026].

MDN Web Docs, 2026. *CSS flexible box layout.* [Online] Available at:
https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout
[Accessed 16 September 2026].

MDN Web Docs, 2026. *Using media queries.* [Online] Available at:
https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries
[Accessed 16 September 2026].

MDN Web Docs, 2026. *Responsive images.* [Online] Available at:
https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images
[Accessed 16 September 2026].

MDN Web Docs, 2026. *Using CSS custom properties (variables).* [Online] Available at:
https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties
[Accessed 16 September 2026].

South Africa Online, n.d. *Nguni cattle beef production in South Africa.* [Online]
Available at: https://southafrica.co.za/nguni-cattle.html
[Accessed 12 August 2026].

Van Eeden, Z., 2025. *Nguni: the legacy of the land.* Farmer's Weekly. [Online]
Available at: https://www.farmersweekly.co.za/animals/cattle/nguni-the-legacy-of-the-land/
[Accessed 12 August 2026].

ZADNA, n.d. *.za Domain Name Authority.* [Online] Available at: https://www.zadna.org.za
[Accessed 12 August 2026].

---

*© 2026 Sithole Agriculture & LiveStocks. Built for WEDE5020 at The Independent
Institute of Education.*
