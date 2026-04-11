# TOAUTO H4 LED Landing Page

A complete, production-ready product landing page for the TOAUTO H4 LED Headlight Bulb. 

## Overview

This project is a high-performance, fully responsive, and visually modern landing page built completely with pure HTML5, vanilla CSS, and vanilla JavaScript. No heavy frameworks or bundlers are included, making it incredibly fast and easy to deploy anywhere.

### Key Features:
- **Mobile-first Responsive Design:** Perfectly fluid layout ensuring a seamless experience across all devices using CSS Grid and Flexbox.
- **Dynamic Elements:** Subtle fade-in on-scroll animations using the `IntersectionObserver` API, along with a pulsing discount badge and a dramatic glow/water-splash effect on the hero product image via CSS `box-shadow`.
- **Premium Aesthetics:** Dark mode design (#0d0d0d) with vibrant red accents (#e8001c), ensuring the text is readable and the product feels high-end.
- **Google Fonts:** Utilizes 'Inter' for crisp typography.

## Folder Structure

```text
/toauto-landing/
├── index.html        # Main HTML structure and content semantics
├── style.css         # Styling, variables, and responsive animations
├── script.js         # Interactive logic and IntersectionObserver
├── /images/          # Contains the product hero image and placeholder assets
└── README.md         # This file
```

## How to Run Locally

Because this project is a pure static site with no build steps or external dependencies:

1. Navigate to the `toauto-landing` folder.
2. Double-click on `index.html` to open it directly in your preferred web browser.
3. No local server, `npm install`, or bundler is required!

*(Note: For the best experience of the `IntersectionObserver` API and to avoid minor local file restrictions in some strict browsers, you can optionally run a simple local server like `npx serve` or use the VS Code Live Server extension).*
