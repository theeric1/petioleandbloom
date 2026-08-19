import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
const publicDir = path.resolve(__dirname, '..', 'public');
const productsPath = path.resolve(__dirname, '..', 'src', 'data', 'products.json');

const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

// Read template from dist/index.html if available, fallback to root index.html
let templatePath = path.join(distDir, 'index.html');
if (!fs.existsSync(templatePath)) {
  templatePath = path.resolve(__dirname, '..', 'index.html');
}
const template = fs.readFileSync(templatePath, 'utf-8');
const today = new Date().toISOString().split('T')[0];

// Helper: strip emoji and clean description for schema
function cleanDesc(desc) {
  return desc
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{2049}\u{2122}\u{2139}\u{2194}-\u{21AA}\u{231A}-\u{23FF}\u{24C2}\u{25AA}-\u{25FE}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\*\*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Helper: make SEO meta description from title
function makeSeoDesc(product) {
  const cat = product.category === 'Serums' ? 'skincare' : 'plant';
  const base = `Buy ${product.title} from Petiole & Bloom. $${product.price.toFixed(2)} with free US shipping & live arrival guarantee.`;
  return base.length > 160 ? base.substring(0, 157) + '...' : base;
}

// Helper: escape HTML entities
function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Helper: write file to multiple directories (both dist and public)
function writeToTargetDirs(relativePath, content) {
  const targets = [path.join(distDir, relativePath), path.join(publicDir, relativePath)];
  for (const t of targets) {
    fs.mkdirSync(path.dirname(t), { recursive: true });
    fs.writeFileSync(t, content);
  }
}

// Build product JSON-LD for a single product page
function productJsonLd(p) {
  const imgUrl = `https://petioleandbloom.com${p.image}`;
  const productUrl = `https://petioleandbloom.com/products/${p.slug}`;
  const cleaned = cleanDesc(p.description);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://petioleandbloom.com/#organization",
        "name": "Petiole & Bloom LLC",
        "url": "https://petioleandbloom.com",
        "logo": "https://petioleandbloom.com/images/products/shopify-9336940429555.webp",
        "sameAs": [
          "https://instagram.com/petioleandbloomllc",
          "https://petioleandbloomllc.etsy.com"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://petioleandbloom.com/"},
          {"@type": "ListItem", "position": 2, "name": "Shop", "item": "https://petioleandbloom.com/shop"},
          {"@type": "ListItem", "position": 3, "name": p.title, "item": productUrl}
        ]
      },
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        "name": p.title,
        "image": [imgUrl],
        "description": cleaned.substring(0, 5000),
        "sku": p.sku,
        "mpn": p.sku,
        "brand": {"@type": "Brand", "name": "Petiole & Bloom"},
        "category": p.googleProductCategory || "Home & Garden > Plants > Live Plants",
        "url": productUrl,
        "sameAs": p.link,
        "identifier_exists": "false",
        "offers": {
          "@type": "Offer",
          "url": productUrl,
          "priceCurrency": "USD",
          "price": p.price.toFixed(2),
          "validFrom": "2026-01-01",
          "priceValidUntil": "2027-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {"@type": "Organization", "name": "Petiole & Bloom LLC"},
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {"@type": "MonetaryAmount", "value": "7.99", "currency": "USD"},
            "shippingDestination": {"@type": "DefinedRegion", "addressCountry": "US"},
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {"@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY"},
              "transitTime": {"@type": "QuantitativeValue", "minValue": 2, "maxValue": 4, "unitCode": "DAY"}
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "US",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 14,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/FreeReturn"
          }
        }
      }
    ]
  };
}

// ============ GENERATE PRODUCT PAGES ============
let productCount = 0;
for (const p of products) {
  const slug = p.slug;
  const seoDesc = makeSeoDesc(p);
  const canonicalUrl = `https://petioleandbloom.com/products/${slug}`;
  const imgUrl = `https://petioleandbloom.com${p.image}`;
  const jsonLd = JSON.stringify(productJsonLd(p));

  let html = template;

  // Replace <title>
  html = html.replace(/<title>.*?<\/title>/, `<title>${escHtml(p.title)} | Petiole &amp; Bloom</title>`);

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escHtml(seoDesc)}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // Replace OG tags
  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escHtml(p.title)} | Petiole &amp; Bloom" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escHtml(seoDesc)}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${imgUrl}" />`);

  // Replace Twitter tags
  html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escHtml(p.title)} | Petiole &amp; Bloom" />`);
  html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escHtml(seoDesc)}" />`);
  html = html.replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${imgUrl}" />`);

  // Replace the existing JSON-LD script block with product-specific one
  html = html.replace(
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">\n${jsonLd}\n    </script>`
  );

  writeToTargetDirs(path.join('products', slug, 'index.html'), html);
  productCount++;
}

// ============ GENERATE SECTION PAGES ============
const sections = [
  { path: 'shop', title: 'Shop All Products', desc: 'Browse all rare tropical plants, vanilla orchids, variegated bananas, and copper peptide serums from Petiole & Bloom. Free US shipping.' },
  { path: 'science', title: 'Peptides & Bio-Actives Science', desc: 'Clinical research behind GHK-Cu copper peptide serums, Niacinamide, silk peptides, and licorice root extract. Peer-reviewed references.' },
  { path: 'care', title: 'Plant Care Guide', desc: 'Step-by-step guide for unboxing, acclimating, watering, and repotting your new tropical plants from Petiole & Bloom.' },
  { path: 'contact', title: 'Contact Us', desc: 'Get in touch with Petiole & Bloom LLC. US-based botanical nursery and peptide formulation lab.' }
];

for (const section of sections) {
  const canonicalUrl = `https://petioleandbloom.com/${section.path}`;
  let html = template;

  html = html.replace(/<title>.*?<\/title>/, `<title>${escHtml(section.title)} | Petiole &amp; Bloom</title>`);
  html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escHtml(section.desc)}" />`);
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalUrl}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escHtml(section.title)} | Petiole &amp; Bloom" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escHtml(section.desc)}" />`);
  html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonicalUrl}" />`);

  writeToTargetDirs(path.join(section.path, 'index.html'), html);
}

// ============ GENERATE SITEMAP.XML ============
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://petioleandbloom.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://petioleandbloom.com/shop</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://petioleandbloom.com/science</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://petioleandbloom.com/care</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://petioleandbloom.com/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

for (const p of products) {
  const imgUrl = `https://petioleandbloom.com${p.image}`;
  const imgTitle = escHtml(p.title);
  sitemap += `  <url>
    <loc>https://petioleandbloom.com/products/${p.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${imgUrl}</image:loc>
      <image:title>${imgTitle}</image:title>
    </image:image>
  </url>
`;
}

sitemap += `</urlset>\n`;

// Write sitemap to both public/ and dist/
writeToTargetDirs('sitemap.xml', sitemap);

console.log(`Pre-rendered ${productCount} product pages + ${sections.length} section pages to dist/ and public/.`);
console.log(`Generated sitemap.xml with ${5 + products.length} URLs.`);
