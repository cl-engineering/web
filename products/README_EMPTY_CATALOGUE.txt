CIRCLE LINE - EMPTY CATALOGUE FOR PUBLICATION

This version has ZERO listed products and keeps all seven custom enquiry categories enabled.
It is prepared with index,follow on the products landing page and the seven Custom pages.
The root sitemap.xml includes those eight URLs and no individual product URLs.
No CL-DEMO product pages, product images, or offline example items remain.

Publish the CONTENTS of Newer/ to your web root (not the Newer folder itself).
When uploading over an existing live site, DELETE the obsolete products/part/ folder
and old product images on the server; uploading a ZIP does not automatically
remove remote files. Old public product URLs otherwise may remain accessible.

Category visibility: edit products/category-settings.json.
To add real inventory later: replace products/catalog.json from your export,
copy the associated images, and run products/Publish_Catalogue.cmd.
This Windows command rebuilds current product pages and the root sitemap.
The Update_Catalogue.cmd command switches products pages to noindex.

The SVG patterns, custom product enquiry forms, GA4 and templates are retained.
This is a static file verification; live hosting and Windows PowerShell execution
have not been tested in this environment.
