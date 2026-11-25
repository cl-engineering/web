CIRCLE LINE ENGINEERING - PRODUCT CATALOGUE
===========================================

PACKAGE SCOPE
This package contains ONLY the products/ folder.
Put products/ beside the website's index.html and sitemap.xml.
The original website is not included or modified by this ZIP.

QUICK START - WINDOWS 10 / 11
1. Export only the products selected for the website in StockApp.
2. Replace products/catalog.json with the exported catalog.json.
3. Copy the exported product images into products/images/.
4. Double-click Update_Catalogue.cmd to regenerate local preview pages (noindex).
5. Review product cards, individual pages, measurements and drawings before uploading.

WINDOWS COMMANDS (ENGLISH)
- Update_Catalogue.cmd : Rebuilds the current website's product pages in
  PREVIEW mode (noindex). Updates the REAL root sitemap to remove all
  products/ URLs while the pages are noindex.
- Publish_Catalogue.cmd : Updates the CURRENT website folder with index,follow
  product pages and updates its REAL root sitemap.xml with only the products
  currently exported by StockApp. Type PUBLISH when asked.
  If any product code starts with CL-DEMO, the generator displays a prominent
  warning and requires a second explicit confirmation: PUBLISH DEMO.
  Declining the warning cancels publication before generated files are changed.
  When accepted, those demo product pages are publicly indexable and listed
  in the sitemap. Each demo product page is visibly identified as a sample.
  No separate test command or disposable copy is involved.

Both commands work with UNC shares such as \\CLE-SERVER\Common\... via
PUSHD/POPD and built-in Windows PowerShell 5.1. No Python or Node needed.
Neither command uploads to a separate host or updates Google Search Console.
If you run it inside a folder already served by your web host, the file changes
may go live immediately. If this is a development copy, deploy the changed
website files separately.

DEMO PUBLICATION WARNING
Publishing example products is allowed ONLY with the extra confirmation.
Doing so makes those example pages eligible for search-engine indexing.
Do not use this for your final commercial catalogue unless the example items
are explicitly meant to be visible to visitors.
You can revert to noindex by running Update_Catalogue.cmd.

AFTER STOCKAPP EXPORTS
The generator reads products/catalog.json, rebuilds products/part/ using only
exported products, and removes obsolete product directories from the LOCAL
copy. When deploying, also delete obsolete product URLs from the REMOTE
server; simply uploading replacement files may leave old folders accessible.
The pattern library remains intact, regardless of which products are exported.

VISUAL AND TECHNICAL BEHAVIOUR
- The drawing appears on the left and dimensions on the right (stacked on
  smaller displays), with one view visible at a time.
- View controls sit above the drawing. Rollers open on the axial/profile view.
- Clicking a measurement automatically selects and highlights the related view.
- Three end-mill shank variants are chosen from cutting_diameter and
  shank_diameter, without adding another StockApp field.
- All technical drawings are schematic illustrations, NOT production drawings.
- The catalogue uses the root fav_topo.png/favicon; the main site files are not
  included in this package.

SEO AND INDEXING
- Preview pages: noindex,follow. The root sitemap excludes products URLs.
- Publication: index,follow. The REAL root sitemap lists the catalogue and
  products currently exported from StockApp, including CL-DEMO examples only
  after an extra confirmation. Demo product pages display a clear sample notice.
- technical-patterns/index.html always remains noindex and outside the sitemap.
- Individual HTML pages have their own title, description, canonical, OG
  metadata and Product JSON-LD.
- Google may choose different snippets, and cannot be guaranteed to index pages.

FILES KEPT INTENTIONALLY
- catalog-sample.js and technical-patterns/patterns-fallback.js let the
  catalogue and drawing library open as an OFFLINE file:// example. They are
  referenced by the HTML and are NOT deployed data sources. HTTP/HTTPS loads
  the current catalog.json and editable SVGs.
- technical-patterns/STOCKAPP_TEMPLATE_INSTRUCTIONS.md and
  technical-patterns/stockapp-template-contract.json are the development
  reference for StockApp's JSON technical specification mapping.
- technical-patterns/Update_Offline_Preview.cmd updates the SVG offline
  snapshot after changing actual SVG files. Never edit that snapshot by hand.

DEPLOYMENT NOTES
For a working HTTP/HTTPS preview, use your test web server or staging site.
Opening products/index.html directly as file:// uses the bundled static demo
snapshot rather than later StockApp exports; use the web-server URL to view
updated inventory. The published catalogue displays no offline warning.
Upload the CONTENTS of the site root, not a nested /Newer/ folder.
Review any demonstration products before allowing search engines to index them.
