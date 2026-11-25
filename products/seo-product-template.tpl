<!doctype html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#1a2c5b">
<title>%%TITLE%% | Circle Line Engineering Auckland</title>
<meta name="description" content="%%META_DESCRIPTION%%">
<meta name="robots" content="%%ROBOTS%%">
<link rel="canonical" href="%%URL%%">
<link rel="icon" href="https://circleline.co.nz/fav_topo.png" type="image/png" sizes="512x512">
<link rel="shortcut icon" href="https://circleline.co.nz/fav_topo.png">
<link rel="apple-touch-icon" href="https://circleline.co.nz/fav_topo.png">
<meta property="og:type" content="product">
<meta property="og:url" content="%%URL%%">
<meta property="og:title" content="%%TITLE%% | Circle Line Engineering">
<meta property="og:description" content="%%META_DESCRIPTION%%">
<meta property="og:site_name" content="Circle Line Engineering Ltd">
<meta property="og:locale" content="en_NZ">
<meta property="og:image" content="%%OG_IMAGE%%">
<meta property="og:image:alt" content="%%OG_IMAGE_ALT%%">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="%%TITLE%% | Circle Line Engineering">
<meta name="twitter:description" content="%%META_DESCRIPTION%%">
<meta name="twitter:image" content="%%OG_IMAGE%%">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap">
<link rel="stylesheet" href="../../seo-product.css">
<link rel="stylesheet" href="../../site-shell.css">
<link rel="stylesheet" href="../../technical-viewer.css">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-D6FDD8TEE1"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-D6FDD8TEE1');</script>
<script type="application/ld+json">%%JSON_LD%%</script>
</head>
<body>
<nav class="site-nav" aria-label="Main navigation">
  <a class="nav-logo" href="../../../" aria-label="Circle Line Engineering — Home"><img src="../../assets/logo-desktop.webp" alt="Circle Line Engineering Ltd"><img src="../../assets/logo-mobile.webp" alt="" class="nav-logo-img-mobile"><div class="nav-logo-text-mobile">Circle Line<span>Engineering Ltd.</span></div></a>
  <ul class="nav-links" id="navLinks">
    <li><a href="../../../#home">Home</a></li><li><a href="../../../#services">Services</a></li><li><a href="../../../#capabilities">Capabilities</a></li><li><a href="../../../#about">About</a></li><li><a href="../../../#gallery">Gallery</a></li><li><a href="../../../#reviews">Reviews</a></li><li><a class="active" aria-current="page" href="../../">Products</a></li><li><a class="nav-cta" href="../../../#contact">Contact Us</a></li>
  </ul>
  <button type="button" class="hamburger" id="hamburger" aria-label="Toggle navigation" aria-controls="navLinks" aria-expanded="false"><span></span><span></span><span></span></button>
</nav>
<main>
%%DEMO_NOTICE%%
<nav class="crumb" aria-label="Breadcrumb"><a href="https://circleline.co.nz/">Home</a> / <a href="../../">Products</a> / %%NAME%%</nav>
<div class="code">%%CATEGORY%% · %%CODE%%</div>
<h1>%%NAME%%</h1>
<p class="intro">%%INTRO%%</p>
<div class="tech-browser" data-primary-view="%%PRIMARY_VIEW%%">
<section class="panel tech-drawing-panel" aria-label="Technical drawing"><h2>Technical drawing</h2>
<div class="tech-view-tabs" role="group" aria-label="Drawing views">%%VIEW_NAV%%</div>
<div class="tech-views">%%DRAWINGS%%<div class="tech-current-view" aria-live="polite"></div></div>
<p class="tech-instruction" role="status" aria-live="polite"></p>
<p class="notice">Illustrative guide only — not to scale or approved for manufacture. Confirm all specifications.</p></section>
<section class="panel tech-measures-panel"><h2>Dimensions</h2><p class="tech-panel-subtitle">Select a measurement to highlight its reference. The drawing view switches automatically when needed.</p><div class="tech-dimension-list">%%DIMENSION_SECTION%%</div></section>
</div>
<section class="panel tech-extra-panel"><h2>More information</h2>
<details><summary>Product photo</summary><div class="inside">%%PHOTO%%</div></details>
%%PROPERTY_SECTION%%
<details><summary>Technical notes</summary><div class="inside">%%NOTES%%</div></details>
<section class="rfq"><h2>Request a quote</h2><p>No online checkout. We will confirm pricing, lead time and availability.</p><label class="custom-requirements-label">Custom enquiry / requirements for this part<textarea id="customRequirements" maxlength="2000" placeholder="Special dimensions, material, drawing reference or other requirements"></textarea></label><div class="actions"><label>Quantity<input id="qty" type="number" min="1" max="1000000" value="1" inputmode="numeric"></label><button id="add" class="button" type="button">Add to enquiry</button><button id="remove" class="button danger" type="button" hidden>Remove from enquiry</button><button id="email" class="button secondary" type="button">Email about this part</button></div><p role="status" id="status"></p></section>
</section>
</main>
<section id="partEnquiryDrawer" class="part-enquiry-drawer" hidden aria-label="Review selected products">
 <div class="part-drawer-head"><h2>Review your enquiry</h2><button id="partCloseReview" type="button">Close</button></div>
 <div id="partEnquiryItems"></div>
 <p class="part-drawer-help">Change quantities or remove products before sending your enquiry.</p>
</section>
<div id="partEnquiryBar" class="part-enquiry-bar" hidden>
 <div class="part-bar-inner"><strong id="partEnquiryCount">0 items selected</strong><div class="part-bar-actions"><button id="partReview" type="button">Review / edit</button><button id="partEmailAll" type="button">Email enquiry</button></div></div>
</div>

<footer class="site-footer"><div class="footer-inner"><div class="footer-logo"><img src="../../assets/logo-footer.webp" alt="Circle Line Engineering Ltd"><div class="footer-logo-text">Circle Line Engineering Ltd.<span>Precision Engineering · Auckland, NZ</span></div></div><div class="footer-nav-col"><ul class="footer-links"><li><a href="../../../#home">Home</a></li><li><a href="../../../#services">Services</a></li><li><a href="../../../#capabilities">Capabilities</a></li><li><a href="../../../#about">About</a></li><li><a href="../../../#gallery">Gallery</a></li><li><a href="../../../#reviews">Reviews</a></li><li><a href="../../">Products</a></li><li><a href="../../../#contact">Contact</a></li></ul></div><p class="footer-copy">© 2026 Circle Line Engineering Ltd. All rights reserved. &nbsp;|&nbsp; 8 Marjorie Jayne Crescent, Ōtāhuhu, Auckland 1062 &nbsp;|&nbsp; <a href="mailto:sales@circleline.co.nz">sales@circleline.co.nz</a></p></div></footer>
<script>window.CircleLinePartData=%%PART_DATA%%;</script>
<script src="../../technical-viewer.js" defer></script>
<script src="../../seo-product.js" defer></script>
<script src="../../site-shell.js" defer></script>
</body></html>
