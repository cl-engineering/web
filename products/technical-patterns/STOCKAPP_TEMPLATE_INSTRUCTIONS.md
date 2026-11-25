# StockApp | Circle Line Engineering: Technical specifications and drawing contract

## Objective

Use **one structured `TechnicalSpecifications` JSON database field** for all technical information, without creating a column for each part type, measurement, material or finish. Keep the existing Name, Description and Category fields. Export the technical JSON as `technicalSpecifications` on each website product.

The product editor must show a **Type** dropdown when a supported category is selected and show the measurement fields associated with that type. For rollers, add a `bearingSeat` selector with `none`, `one_side` and `both_sides`. These controls should work on desktop and mobile.

Every dimension is an object with `key`, `label`, `value` and `unit`. The keys below must match exactly; do not substitute A/B/C letters. The website assigns measurement letters automatically based on export order.

## Categories, types and measurement fields


### Bolts & Studs

**`hex_bolt`**

| Dimension key | Label | Unit |
|---|---|---|
| `thread_size` | Thread size | (none) |
| `pitch` | Pitch | mm |
| `length_under_head` | Length under head | mm |
| `head_width_across_flats` | Head width across flats | mm |
| `head_height` | Head height | mm |


**`t_bolt`**

| Dimension key | Label | Unit |
|---|---|---|
| `thread_size` | Thread size | (none) |
| `pitch` | Pitch | mm |
| `length_under_head` | Length under head | mm |
| `t_head_width` | T-head width | mm |
| `t_head_length` | T-head length | mm |
| `t_head_thickness` | T-head thickness | mm |
| `slot_width` | Slot width | mm |


**`double_ended_stud`**

| Dimension key | Label | Unit |
|---|---|---|
| `thread_size` | Thread size | (none) |
| `pitch` | Pitch | mm |
| `overall_length` | Overall length | mm |
| `thread_length_end_1` | Thread length at end 1 | mm |
| `thread_length_end_2` | Thread length at end 2 | mm |
| `unthreaded_length` | Unthreaded length | mm |


### Nuts

**`hex_nut`**

| Dimension key | Label | Unit |
|---|---|---|
| `thread_size` | Thread size | (none) |
| `pitch` | Pitch | mm |
| `across_flats` | Across flats | mm |
| `height` | Height | mm |


**`lock_nut`**

| Dimension key | Label | Unit |
|---|---|---|
| `thread_size` | Thread size | (none) |
| `pitch` | Pitch | mm |
| `across_flats` | Across flats | mm |
| `height` | Height | mm |


**`flange_nut`**

| Dimension key | Label | Unit |
|---|---|---|
| `thread_size` | Thread size | (none) |
| `pitch` | Pitch | mm |
| `across_flats` | Across flats | mm |
| `height` | Height | mm |
| `flange_diameter` | Flange diameter | mm |
| `flange_thickness` | Flange thickness | mm |


### Bushes

**`plain_bush`**

| Dimension key | Label | Unit |
|---|---|---|
| `inside_diameter` | Inside diameter | mm |
| `outside_diameter` | Outside diameter | mm |
| `overall_length` | Overall length | mm |


**`flanged_bush`**

| Dimension key | Label | Unit |
|---|---|---|
| `inside_diameter` | Inside diameter | mm |
| `body_outside_diameter` | Body outside diameter | mm |
| `overall_length` | Overall length | mm |
| `flange_diameter` | Flange diameter | mm |
| `flange_thickness` | Flange thickness | mm |


### Washers

**`flat_washer`**

| Dimension key | Label | Unit |
|---|---|---|
| `inside_diameter` | Inside diameter | mm |
| `outside_diameter` | Outside diameter | mm |
| `thickness` | Thickness | mm |


**`spring_washer`**

| Dimension key | Label | Unit |
|---|---|---|
| `inside_diameter` | Inside diameter | mm |
| `outside_diameter` | Outside diameter | mm |
| `thickness` | Thickness | mm |


**`hardened_washer`**

| Dimension key | Label | Unit |
|---|---|---|
| `inside_diameter` | Inside diameter | mm |
| `outside_diameter` | Outside diameter | mm |
| `thickness` | Thickness | mm |


### Rollers

**`v_groove`**

| Dimension key | Label | Unit |
|---|---|---|
| `outside_diameter` | Outside diameter | mm |
| `overall_width` | Overall width | mm |
| `centre_bore` | Centre bore | mm |
| `groove_angle` | Groove angle | deg |
| `groove_depth` | Groove depth | mm |
| `bearing_seat_diameter_side_1` | Bearing seat diameter - side 1 | mm |
| `bearing_seat_depth_side_1` | Bearing seat depth - side 1 | mm |
| `bearing_seat_diameter_side_2` | Bearing seat diameter - side 2 | mm |
| `bearing_seat_depth_side_2` | Bearing seat depth - side 2 | mm |

SVG patterns: `v_groove__none` (`none`), `v_groove__one_side` (`one_side`), `v_groove__both_sides` (`both_sides`).


**`radius_groove`**

| Dimension key | Label | Unit |
|---|---|---|
| `outside_diameter` | Outside diameter | mm |
| `overall_width` | Overall width | mm |
| `centre_bore` | Centre bore | mm |
| `groove_radius` | Groove radius | mm |
| `groove_depth` | Groove depth | mm |
| `bearing_seat_diameter_side_1` | Bearing seat diameter - side 1 | mm |
| `bearing_seat_depth_side_1` | Bearing seat depth - side 1 | mm |
| `bearing_seat_diameter_side_2` | Bearing Seat Diameter Side 2 | mm |
| `bearing_seat_depth_side_2` | Bearing Seat Depth Side 2 | mm |

SVG patterns: `radius_groove__none` (`none`), `radius_groove__one_side` (`one_side`), `radius_groove__both_sides` (`both_sides`).


**`flat_bottom_v_groove`**

| Dimension key | Label | Unit |
|---|---|---|
| `outside_diameter` | Outside diameter | mm |
| `overall_width` | Overall width | mm |
| `centre_bore` | Centre bore | mm |
| `groove_angle` | Groove angle | deg |
| `groove_depth` | Groove depth | mm |
| `bottom_flat_width` | Bottom flat width | mm |
| `bearing_seat_diameter_side_1` | Bearing Seat Diameter Side 1 | mm |
| `bearing_seat_depth_side_1` | Bearing Seat Depth Side 1 | mm |
| `bearing_seat_diameter_side_2` | Bearing Seat Diameter Side 2 | mm |
| `bearing_seat_depth_side_2` | Bearing Seat Depth Side 2 | mm |

SVG patterns: `flat_bottom_v_groove__none` (`none`), `flat_bottom_v_groove__one_side` (`one_side`), `flat_bottom_v_groove__both_sides` (`both_sides`).


### Bearings

**`deep_groove_ball_bearing`**

| Dimension key | Label | Unit |
|---|---|---|
| `bore_diameter` | Bore diameter | mm |
| `outside_diameter` | Outside diameter | mm |
| `width` | Width | mm |


### Workshop Tools

**`carbide_drill`**

| Dimension key | Label | Unit |
|---|---|---|
| `drill_diameter` | Drill diameter | mm |
| `point_angle` | Point angle | deg |
| `shank_diameter` | Shank diameter | mm |
| `overall_length` | Overall length | mm |


**`solid_carbide_end_mill`**

| Dimension key | Label | Unit |
|---|---|---|
| `cutting_diameter` | Cutting diameter | mm |
| `flute_count` | Flute count | (none) |
| `shank_diameter` | Shank diameter | mm |
| `overall_length` | Overall length | mm |

SVG patterns: `solid_carbide_end_mill__equal` (`equal`), `solid_carbide_end_mill__shank_larger` (`shank_larger`), `solid_carbide_end_mill__shank_smaller` (`shank_smaller`).


## Roller bearing-seat rules

For `v_groove`, `radius_groove` and `flat_bottom_v_groove`, set `bearingSeat` to `none`, `one_side`, or `both_sides`. With `none`, omit bearing seat dimensions. With `one_side`, include `bearing_seat_diameter_side_1` and `bearing_seat_depth_side_1`. With `both_sides`, include those fields and `bearing_seat_diameter_side_2` plus `bearing_seat_depth_side_2`. These values determine which SVG variant appears.

## Solid carbide end mill rules

Always export `type = solid_carbide_end_mill`. Do **not** add a separate shank-relation database field. Both `cutting_diameter` and `shank_diameter` must be positive millimetre values. The website compares these values automatically: equal diameters use `solid_carbide_end_mill__equal`, a larger shank uses `solid_carbide_end_mill__shank_larger`, and a smaller shank uses `solid_carbide_end_mill__shank_smaller`. If either diameter is missing or invalid, omit the schematic rather than selecting an inaccurate template. `flute_count` has no unit and is used for the end-view flute illustration when it is an integer from 1 to 12.

## Shared optional properties

Material, Hardness, Finish, and notes are optional. Omit empty fields rather than exporting placeholders. Recommended structure: `properties: { material, hardness, finish }`, with `notes` on the `technicalSpecifications` root. The website also accepts the older `technicalSpecifications.properties.notes` location, but new exports should avoid it.

## Export and web-page generation

Export only the items selected for display on the website. After copying the exported `catalog.json` and associated `images/` to `products/`, run `Update_Catalogue.cmd` (noindex preview). Once real products have been verified, run `Publish_Catalogue.cmd` (indexing preparation). Both call built-in Windows PowerShell, update static product HTML pages to match the export, remove previous generated pages, and prepare the root `sitemap.xml`. The program refuses publication if demo product codes remain. Neither uploads to the internet.

The SVG master files remain in `products/technical-patterns/svg/`; the associated pattern mapping lives in `patterns.json`. The machine-readable form and detailed view paths are in `stockapp-template-contract.json`. Do not change these keys unless you also update the website resolver and SVG references.

**Engineering note:** SVGs are schematic examples only and should not be used as production drawings without engineering verification.
