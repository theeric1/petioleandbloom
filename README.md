# Petiole & Bloom Web Application

A modern, fast, static web storefront for Petiole & Bloom integrating with Shopify and Etsy for synchronization.
Built with React, TypeScript, Vite, and designed with standard CSS utilizing glassmorphism and OKLCH color palettes.

## Features
- **Shopify & Etsy Catalog Sync**: Merges products from a Shopify endpoint and Etsy RSS feed into a single unified JSON catalog (`src/data/products.json`).
- **CSS View Transitions**: Smooth page navigation using the View Transitions API.
- **Scroll-Driven Animations**: Subtle fade-in animations on scroll (`animation-timeline: view()`).
- **Responsive**: Mobile-first design that seamlessly scales to desktop.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Automated Data Sync

To sync the catalog manually:
```bash
npm run sync-etsy
```
*(Requires Python 3.11+ and `requests`, `beautifulsoup4`)*

A GitHub Action is configured in `.github/workflows/sync.yml` to automatically run this sync script daily at midnight UTC and commit the updated `products.json` file back to the repository.

## Deployment (Cloudflare Pages)

1. Connect your GitHub repository to **Cloudflare Pages**.
2. Configure the build settings:
   - **Framework Preset**: `Create React App` (or `None` and manually specify)
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
3. Cloudflare Pages will now automatically build and deploy your site on every push to the `main` branch. The daily GitHub Action sync will automatically trigger a new Cloudflare build to keep the live catalog updated!
