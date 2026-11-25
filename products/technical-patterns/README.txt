CIRCLE LINE - TECHNICAL SVG PATTERN LIBRARY

REFERENCE PAGE
  /products/technical-patterns/
  Standalone, clean page: editable technical SVG view at left; corresponding
  dimension letters, labels and example values at right. Choose a product type
  from the selector. The technical reference library displays all views for easy inspection. Click a row on the right to highlight its
  corresponding dimension lines in the SVG.

SOURCE OF TRUTH
  Edit the vector files in /products/technical-patterns/svg/ using an SVG
  editor (Inkscape, Illustrator, or text editor). Keep the SVG's
  data-dimension="..." groups and the data-dimension-value text inside them.
  You can move paths, dimension lines and labels in the same group freely.
  Do not rename the data-dimension keys unless you also change the StockApp
  technicalSpecifications dimension keys.

  Example: v_groove__both_sides__1.svg is the front view of a V roller with
  bearing seats on both ends. The catalogue loads that very file for
  products with technicalSpecifications.type="v_groove" and
  technicalSpecifications.bearingSeat="both_sides".

  The second Double-Ended Stud view is an enlarged thread profile with pitch
  between adjacent crests. Rollers use separate front, axial-section and
  groove-detail SVGs to avoid excessive dimension leaders.

  All mappings are in patterns.json. All drawings are vector SVG, not raster.
  The page and public catalogue both use patterns.js and patterns.json.
  Changes made to the SVG files appear on the live site on reload.

HOW TO VIEW UPDATED SVG LOCALLY
  Open the page on a local/test HTTP server or on the website staging URL.
  A static hosting preview supports loading SVG files with fetch().

  Opening index.html directly using file:// uses the bundled OFFLINE preview
  from patterns-fallback.js. This is a snapshot for convenience. After
  changing SVGs, preview through HTTP to see your changes; do not edit that
  fallback file by hand. Regenerate it from all SVGs for updated offline mode.

EXPORT UPDATES
  StockApp updates only replace products/catalog.json and products/images/.
  Keep technical-patterns/ unchanged so drawing adjustments are preserved.

SAFETY
  All drawings are illustrative examples, not manufacturing drawings,
  not to scale and not verified by an engineer. Check each outline and each
  indicated measuring point against the real part before publishing.

OPTIONAL OFFLINE REFRESH
  After editing SVG files, run:
    products\technical-patterns\Update_Offline_Preview.cmd
  to update the embedded preview too, so file:// will show your changes.
  Running this does not change the SVGs or the public product catalogue.

END MILL SHANK RELATION (AUTOMATIC)
  Same TechnicalSpecifications.type for all three templates:
    solid_carbide_end_mill
  No extra product field is necessary. The drawing resolver compares
  dimensions[].key == cutting_diameter with shank_diameter, both in mm:
    equal          -> solid_carbide_end_mill__equal
    shank larger   -> solid_carbide_end_mill__shank_larger
    shank smaller  -> solid_carbide_end_mill__shank_smaller
  If a dimension is missing/invalid, the site omits the drawing instead of
  falsely choosing a geometry. It still shows the available dimensions.
  Do not rename these dimensions or the technicalSpecifications.type value.
