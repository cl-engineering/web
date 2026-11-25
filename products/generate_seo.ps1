#Requires -Version 5.1
<#+
StockApp / Circle Line static SEO generator.
Runs on Windows PowerShell 5.1+ (built into Windows 10/11), no Python, Node or install needed.
Default = PREVIEW with noindex. -Publish requires confirmation for demo products.
Works inside complete website root. Updates root sitemap.xml after generating all pages.
#>
[CmdletBinding()]
param(
    [switch]$Publish,
    [string]$BaseSitemap = ''
)
$ErrorActionPreference = 'Stop'
$Root = $PSScriptRoot
$Base = 'https://circleline.co.nz'
$PackageRoot = Split-Path -Parent $Root
$Utf8 = [System.Text.UTF8Encoding]::new($false)

function Text($x) { if ($null -eq $x) { return '' }; return [string]$x }
function Html($x) { return [System.Net.WebUtility]::HtmlEncode((Text $x)) }
function Json($x) { return (ConvertTo-Json -InputObject $x -Depth 60 -Compress).Replace('<', '\u003c') }
function Slug($value) {
    $normalized = (Text $value).Normalize([System.Text.NormalizationForm]::FormD)
    $builder = New-Object System.Text.StringBuilder
    foreach ($char in $normalized.ToCharArray()) {
        $cat = [System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($char)
        if ($cat -eq [System.Globalization.UnicodeCategory]::NonSpacingMark) { continue }
        if ([int][char]$char -lt 128) { [void]$builder.Append([char]::ToLowerInvariant($char)) }
    }
    return ([regex]::Replace($builder.ToString(), '[^a-z0-9]+', '-')).Trim('-')
}
function Description($inputText, [int]$limit = 155) {
    $s = [regex]::Replace((Text $inputText).Trim(), '\s+', ' ')
    if ($s.Length -le $limit) { return $s }
    $part = $s.Substring(0, $limit)
    $last = $part.LastIndexOf(' ')
    if ($last -gt 30) { $part = $part.Substring(0, $last) }
    return ($part.TrimEnd(' ', ',', '.', ';') + '.')
}
function DimensionValue($d) {
    $v = (Text $d.value).Trim(); $u = (Text $d.unit).Trim()
    if (-not $v) { return '' }
    if ($v -match '^M\d+(?:[.,]\d+)?(?:\s*[xX]\s*\d+(?:[.,]\d+)?)?$') { return $v }
    if ($u -eq 'deg') { return $v.TrimEnd([char]176) + [string][char]176 }
    if ($u) { return "$v $u" }
    return $v
}
function ImageUrl($img) {
    if ($null -eq $img) { return '' }
    if ($img -isnot [string]) {
        $ref=$img
        $img=$ref.url
        if (-not $img) {$img=$ref.path}
        if (-not $img) {$img=$ref.fileName}
        if (-not $img) {return ''}
    }
    if ($img -cmatch '^images/[a-zA-Z0-9_.-]+\.(?:png|jpg|jpeg|webp)$' -and (Test-Path (Join-Path $Root $img) -PathType Leaf)) {
        return "$Base/products/$img"
    }
    return ''
}
function Read-Json([string]$path) {
    if (-not (Test-Path $path -PathType Leaf)) { throw "File not found: $path" }
    return [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
}
function Write-Utf8([string]$path, [string]$content) {
    $parent = Split-Path $path -Parent
    if (-not (Test-Path $parent)) { [void](New-Item -Type Directory -Path $parent -Force) }
    [System.IO.File]::WriteAllText($path, $content, $Utf8)
}
function Get-Fields($product) {
    $t = $product.technicalSpecifications
    if ($null -eq $t) { $t = [pscustomobject]@{ type=''; dimensions=@(); properties=[pscustomobject]@{}; notes='' } }
    $dims = @($t.dimensions | Where-Object { $null -ne $_ -and (Text $_.key).Trim() -and (Text $_.value).Trim() })
    $props = @()
    if ($null -ne $t.properties) {
        if ($t.properties -is [array]) {
            foreach ($p in $t.properties) {
                if ((Text $p.name).Trim() -and (Text $p.value).Trim()) { $props += ,([pscustomobject]@{key=[string]$p.name;value=[string]$p.value}) }
            }
        } else {
            foreach ($p in $t.properties.PSObject.Properties) {
                if ($p.Name -eq 'notes') { continue }
                if ($null -ne $p.Value -and (Text $p.Value).Trim()) { $props += ,([pscustomobject]@{key=$p.Name;value=(Text $p.Value).Trim()}) }
            }
        }
    }
    $notes = $t.notes
    if ($null -eq $notes -or (-not (Text $notes).Trim())) {
        if ($t.properties -isnot [array] -and $null -ne $t.properties) { $notes=$t.properties.notes }
    }
    if ($null -eq $notes) { $notes=@() }
    if ($notes -is [string]) { if ($notes.Trim()) { $notes=@($notes) } else { $notes=@() } }
    if ($notes -is [array] -and $notes.Count -gt 1) {
        $chars=$true
        foreach ($n in $notes) { if ($n -isnot [string] -or $n.Length -ne 1) { $chars=$false;break } }
        if ($chars) { $notes=@(-join $notes) }
    }
    return [pscustomobject]@{technical=$t;dimensions=$dims;properties=$props;notes=@($notes)}
}
function PatternFor($manifest,$technical,$dims) {
    $typeId=(Text $technical.type).Trim().ToLowerInvariant()
    $matches=@($manifest.templates | Where-Object { $_.type -eq $typeId })
    if (-not $matches.Count) { return $null }
    if ($typeId -eq 'solid_carbide_end_mill') {
        $cut=$null;$shank=$null
        foreach ($d in $dims) {
            if ($d.key -ne 'cutting_diameter' -and $d.key -ne 'shank_diameter') { continue }
            if ((Text $d.unit) -ne 'mm') { continue }
            $n=0.0
            if (-not [double]::TryParse((Text $d.value).Replace(',','.'),[System.Globalization.NumberStyles]::Float,[System.Globalization.CultureInfo]::InvariantCulture,[ref]$n)) { continue }
            if ($d.key -eq 'cutting_diameter') { $cut=$n } else { $shank=$n }
        }
        if ($null -eq $cut -or $null -eq $shank -or $cut -le 0 -or $shank -le 0) { return $null }
        $rel=if ([Math]::Abs($cut-$shank) -lt 0.000001) {'equal'} elseif ($shank -gt $cut) {'shank_larger'} else {'shank_smaller'}
        return @($matches | Where-Object { $_.shankDiameterRelation -eq $rel } | Select-Object -First 1) | Select-Object -First 1
    }
    if ($matches.Count -gt 1) {
        $seat=(Text $technical.bearingSeat).Trim().ToLowerInvariant().Replace('-','_').Replace(' ','_')
        if (-not $seat) {$seat='none'}
        return @($matches | Where-Object { $_.bearingSeat -eq $seat } | Select-Object -First 1) | Select-Object -First 1
    }
    return $matches[0]
}
function SvgFor($svgPath,$dims) {
    $doc=New-Object System.Xml.XmlDocument
    $doc.XmlResolver = $null
    $doc.Load($svgPath)
    $groups=@($doc.SelectNodes('//*[@data-dimension]'))
    $letters=@{}
    for ($i=0;$i -lt $dims.Count;$i++) {
        $letters[[string]$dims[$i].key]=if ($i -lt 26) {[string][char](65+$i)} else {[string]($i+1)}
    }
    foreach ($group in $groups) {
        $k=$group.GetAttribute('data-dimension')
        if (-not $letters.ContainsKey($k)) { [void]$group.ParentNode.RemoveChild($group);continue }
        foreach ($node in @($group.SelectNodes('.//*[@data-dimension-value]'))) { $node.InnerText=$letters[$k] }
    }
    $flute=@($doc.SelectNodes('//*[@data-flute-geometry]'))
    if ($flute.Count) {
        $count=0
        foreach ($d in $dims) {if ($d.key -eq 'flute_count') { [void][int]::TryParse((Text $d.value),[ref]$count); break }}
        if ($count -ge 1 -and $count -le 12) {
            foreach ($node in $flute) {
                $node.RemoveAll()
                for ($i=0;$i -lt $count;$i++) {
                    $a=(2*[Math]::PI*$i/$count)-([Math]::PI/4)
                    $circ=$doc.CreateElement('circle','http://www.w3.org/2000/svg')
                    $circ.SetAttribute('cx', [string](207+61*[Math]::Cos($a)))
                    $circ.SetAttribute('cy', [string](187+61*[Math]::Sin($a)))
                    $circ.SetAttribute('r', [string]$(if ($count -gt 8) {15} elseif ($count -gt 6) {21} else {29}))
                    $circ.SetAttribute('fill','#fff');$circ.SetAttribute('stroke','#263f5b');$circ.SetAttribute('stroke-width','3')
                    [void]$node.AppendChild($circ)
                }
            }
        }
    }
    $doc.DocumentElement.SetAttribute('focusable','false')
    return $doc.DocumentElement.OuterXml
}
function RenderPage($category,$product,$manifest,[string]$template,[bool]$preview) {
    $code=[string]$product.code; $name=[string]$product.name; $slug=Slug $code
    $isDemo=$code.StartsWith('CL-DEMO',[System.StringComparison]::OrdinalIgnoreCase)
    $url="$Base/products/part/$slug/"
    $brief=Description $(if ($product.description) {$product.description} else {"Engineering part $code - request a quote from Circle Line Engineering."}) 260
    $metaDesc=Description "$name. $(if ($product.description) {$product.description} else {'Explore technical dimensions and request a quote.'})" 157
    $f=Get-Fields $product; $dims=$f.dimensions; $props=$f.properties; $notes=$f.notes; $photo=ImageUrl $product.image
    $pattern=PatternFor $manifest $f.technical $dims
    $drawings=''
    $viewNav=''
    $primaryView=if ($f.technical.type -in @('v_groove','radius_groove','flat_bottom_v_groove')) {'axial'} else {'first'}
    if ($null -ne $pattern) {
        $viewIndex=0
        foreach ($v in $pattern.views) {
            $path=Join-Path (Join-Path $Root 'technical-patterns') $v.file
            if (Test-Path $path -PathType Leaf) {
                $svg=SvgFor $path $dims
                $index=[string]$viewIndex
                $viewName=Html $v.name
                $viewNav += '<button type="button" class="tech-view-tab" data-view-index="'+$index+'" aria-pressed="false">'+$viewName+'</button>'
                $drawings += '<div class="tech-view" data-view-index="'+$index+'" data-view-name="'+$viewName+'" hidden>'+$svg+'</div>'
                $viewIndex++
            }
        }
    }
    if (-not $drawings) { $drawings='<p>No technical illustration for this type. See the dimensions alongside.</p>' }
    $dimHtml=''
    for ($i=0;$i -lt $dims.Count;$i++) {
        $d=$dims[$i];$letter=if ($i -lt 26) {[string][char](65+$i)}else{[string]($i+1)}
        $label=if ($d.label) {[string]$d.label} else {([string]$d.key).Replace('_',' ')}
        $dimHtml += '<button type="button" class="tech-dimension" data-dimension-key="'+(Html $d.key)+'" aria-pressed="false"><span class="tech-dimension-key">'+$letter+'</span><span class="tech-dimension-label">'+(Html $label)+'</span><strong class="tech-dimension-value">'+(Html (DimensionValue $d))+'</strong></button>'
    }
    $propHtml=''
    $extraProperties=@()
    foreach ($p in $props) {
        $label=[string]$p.key; $pretty=$label.Replace('_',' ')
        $propHtml += '<div class="prop"><span>'+(Html $pretty)+'</span><strong>'+(Html $p.value)+'</strong></div>'
        $extraProperties += ,@{ '@type'='PropertyValue'; name=$pretty; value=$p.value }
    }
    $noteHtml=''
    foreach ($note in $notes) {if ((Text $note).Trim()) {$noteHtml += '<p>'+(Html $note)+'</p>'}}
    if (-not $noteHtml) { $noteHtml='<p>Confirm dimensions, tolerances, finishes and availability before ordering.</p>' }
    $photoHtml=if ($photo) {'<img class="photo" src="'+(Html $photo)+'" alt="'+(Html $name)+'" loading="lazy">'} else {'<div class="placeholder">Product photo not available</div>'}
    $pSchema=@{'@type'='Product';'@id'=$url+'#product';name=$name;sku=$code;description=(Description $product.description 600);url=$url}
    if (-not $pSchema.description) {$pSchema.description=$name}
    if ($photo) {$pSchema.image=@($photo)}
    $adprops=@()
    foreach ($d in $dims) { $adprops+=,@{'@type'='PropertyValue';name=$(if ($d.label) {[string]$d.label}else{[string]$d.key});value=(DimensionValue $d)} }
    $adprops+= $extraProperties
    if ($adprops.Count) { $pSchema.additionalProperty=$adprops }
    $graph=@{'@context'='https://schema.org';'@graph'=@(
        @{'@type'='WebPage';'@id'=$url+'#webpage';url=$url;name="$name | Circle Line Engineering";description=$metaDesc;inLanguage='en-NZ';isPartOf=@{'@id'=$Base+'/#website'};mainEntity=@{'@id'=$url+'#product'}},
        @{'@type'='BreadcrumbList';itemListElement=@(
          @{'@type'='ListItem';position=1;name='Home';item=$Base+'/'},
          @{'@type'='ListItem';position=2;name='Product catalogue';item=$Base+'/products/'},
          @{'@type'='ListItem';position=3;name=$name;item=$url})},$pSchema)}
    $partData=@{key=((Slug $category)+':'+$code); title=$name; code=$code;unit=$(if ($product.unit) {$product.unit}else{'pcs'})}
    $tokens=@{
      '%%TITLE%%'=(Html $name);
      '%%NAME%%'=(Html $name);
      '%%CATEGORY%%'=(Html $category);
      '%%CODE%%'=(Html $code);
      '%%META_DESCRIPTION%%'=(Html $metaDesc);
      '%%ROBOTS%%'=$(if ($preview) {'noindex,follow'} else {'index,follow'});
      '%%URL%%'=(Html $url);
      '%%OG_IMAGE%%'=(Html $(if ($photo) {$photo}else{$Base+'/fav_wats.png'}));
      '%%OG_IMAGE_ALT%%'=(Html $(if ($photo) {$name}else{'Circle Line Engineering'}));
      '%%JSON_LD%%'=(Json $graph);
      '%%DEMO_NOTICE%%'=$(if ($isDemo) {'<aside class="preview-notice" role="note">Demonstration product - sample specifications only. This is not a confirmed item for sale; please contact us about real availability.</aside>'}else{''});
      '%%INTRO%%'=(Html $(if ($product.description) {$product.description}else{$brief}));
      '%%DRAWINGS%%'=$drawings;
      '%%VIEW_NAV%%'=$viewNav;
      '%%PRIMARY_VIEW%%'=$primaryView;
      '%%DIMENSION_SECTION%%'=$(if ($dimHtml) {$dimHtml}else{'<p>Dimensions are not available for this product.</p>'});
      '%%PHOTO%%'=$photoHtml;
      '%%PROPERTY_SECTION%%'=$(if ($propHtml) {'<details><summary>Material &amp; other details</summary><div class="inside">'+$propHtml+'</div></details>'}else{''});
      '%%NOTES%%'=$noteHtml;
      '%%PART_DATA%%'=(Json $partData)
    }
    $output=$template
    foreach ($token in $tokens.Keys) { $output=$output.Replace($token, [string]$tokens[$token]) }
    # Ensure GA4 is installed exactly once on every generated product page.
    # Applies to both Update_Catalogue.cmd and Publish_Catalogue.cmd.
    if ($output -notmatch 'G-D6FDD8TEE1') {
        $gaTag = '<script async src="https://www.googletagmanager.com/gtag/js?id=G-D6FDD8TEE1"></script>' + "`n" + '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag(''js'',new Date());gtag(''config'',''G-D6FDD8TEE1'');</script>'
        $output = $output.Replace('</head>', $gaTag + "`n" + '</head>')
    }
    return $output
}
function RenderCustomPage($category, [string]$template, [bool]$preview) {
    $name=[string]$category
    $slug=Slug $name
    $display=switch ($slug) {
        'rollers' {'Custom Roller'}
        'bearings' {'Custom Bearing'}
        'bolts-studs' {'Custom Bolt / Stud'}
        'bushes' {'Custom Bush'}
        'nuts' {'Custom Nut'}
        'washers' {'Custom Washer'}
        'workshop-tools' {'Custom Workshop Tool'}
        default {'Custom ' + $name}
    }
    $url="$Base/products/custom/$slug/"
    $title="$display | Custom Engineering Parts | Circle Line Engineering"
    $desc="Request a quote for $($name.ToLowerInvariant()) made to your requirements in Auckland, New Zealand. Select a part type, view technical sketches, enter dimensions and material."
    $robots=if ($preview) {'noindex,follow'} else {'index,follow'}
    $graph=@{'@context'='https://schema.org';'@graph'=@(
      @{'@type'='WebPage';'@id'=$url+'#webpage';url=$url;name=$title;description=$desc;inLanguage='en-NZ';isPartOf=@{'@id'=$Base+'/#website'};publisher=@{'@id'=$Base+'/#business'}},
      @{'@type'='BreadcrumbList';itemListElement=@(
          @{'@type'='ListItem';position=1;name='Home';item=$Base+'/'},
          @{'@type'='ListItem';position=2;name='Product catalogue';item=$Base+'/products/'},
          @{'@type'='ListItem';position=3;name=$display;item=$url})})}
    $txt=$template
    # A relative base preserves all catalogue CSS/JS/image URLs while the page is under custom/<category>/.
    $txt=$txt.Replace('<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">', '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' + "`n" + '<base href="../../">')
    $txt=[regex]::Replace($txt,'<title>[\s\S]*?</title>','<title>'+(Html $title)+'</title>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    $txt=[regex]::Replace($txt,'<meta name="description" content="[^"]*">','<meta name="description" content="'+(Html $desc)+'">')
    $txt=[regex]::Replace($txt,'<meta name="robots" content="[^"]*">','<meta name="robots" content="'+$robots+'">')
    $txt=[regex]::Replace($txt,'<link rel="canonical" href="[^"]*">','<link rel="canonical" href="'+$url+'">')
    $txt=[regex]::Replace($txt,'<meta property="og:url" content="[^"]*">','<meta property="og:url" content="'+$url+'">')
    $txt=[regex]::Replace($txt,'<meta property="og:title" content="[^"]*">','<meta property="og:title" content="'+(Html $title)+'">')
    $txt=[regex]::Replace($txt,'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="'+(Html $desc)+'">')
    $txt=[regex]::Replace($txt,'<meta name="twitter:title" content="[^"]*">','<meta name="twitter:title" content="'+(Html $title)+'">')
    $txt=[regex]::Replace($txt,'<meta name="twitter:description" content="[^"]*">','<meta name="twitter:description" content="'+(Html $desc)+'">')
    $schema='<script type="application/ld+json" id="catalogue-schema">'+(Json $graph)+'</script>'
    $txt=[regex]::Replace($txt,'<script type="application/ld\+json" id="catalogue-schema">[\s\S]*?</script>', [System.Text.RegularExpressions.MatchEvaluator]{param($m) $schema})
    # Set the initial view without a URL fragment. The regular catalogue JS renders the interactive form.
    $init='<script>window.CircleLineInitialCustomCategory='+ (Json $slug) +';</script>'
    $txt=$txt.Replace('<script src="catalog.js" defer></script>', $init + "`n" + '<script src="catalog.js" defer></script>')
    # Pre-render category heading for crawlers and JavaScript-disabled visitors.
    $static='<section id="customView" class="product-detail" aria-label="Custom part details"><div class="container"><h1 class="detail-title">'+(Html $display)+'</h1><p class="detail-lead">'+(Html $desc)+'</p><p>Enable JavaScript to select the part type, inspect the drawings and enter your measurements.</p></div></section>'
    $txt=$txt.Replace('<section id="customView" class="product-detail" hidden aria-label="Custom part details"></section>', $static)
    return $txt
}

function UpdateCatalogue($items, [bool]$preview) {
    $file=Join-Path $Root 'index.html'
    $txt=[System.IO.File]::ReadAllText($file,[System.Text.Encoding]::UTF8)
    $robots=if($preview){'noindex,follow'}else{'index,follow'}
    $robotsTag='<meta name="robots" content="'+$robots+'">'
    if ($txt -match '<meta name="robots" content="[^"]*">') { $txt=[regex]::Replace($txt,'<meta name="robots" content="[^"]*">',$robotsTag) }
    else { $txt=$txt.Replace('<meta charset="utf-8">', '<meta charset="utf-8">' + "`n" + $robotsTag) }
    $elements=@()
    for($i=0;$i -lt $items.Count;$i++) {
        $p=$items[$i].product
        $elements+=,@{'@type'='ListItem';position=$i+1;name=$p.name;url="$Base/products/part/$(Slug $p.code)/"}
    }
    $collection=@{'@context'='https://schema.org';'@graph'=@(
      @{'@type'='CollectionPage';'@id'=$Base+'/products/#webpage';url=$Base+'/products/';name='Engineering Parts Catalogue | Circle Line Engineering';description='Engineering parts catalogue for enquiries and quotes in Auckland, New Zealand.';isPartOf=@{'@id'=$Base+'/#website'};publisher=@{'@id'=$Base+'/#business'};inLanguage='en-NZ'},
      @{'@type'='ItemList';'@id'=$Base+'/products/#items';numberOfItems=$items.Count;itemListElement=$elements})}
    $jsonBlock='<script type="application/ld+json" id="catalogue-schema">'+(Json $collection)+'</script>'
    if ($txt.Contains('id="catalogue-schema"')) {
        $txt=[regex]::Replace($txt,'<script type="application/ld\+json" id="catalogue-schema">[\s\S]*?</script>',[System.Text.RegularExpressions.MatchEvaluator]{ param($m) $jsonBlock })
    } else { $txt=$txt.Replace('<!-- Uses the same Google Analytics measurement ID', $jsonBlock + "`n" + '<!-- Uses the same Google Analytics measurement ID') }
    # The catalogue's product cards link directly to generated SEO pages.
    # Do not inject a visible "Browse individual product pages" directory.
    $txt=[regex]::Replace($txt,'\s*<nav id="seo-product-directory"[\s\S]*?</nav>','')
    Write-Utf8 $file $txt
}
function UpdateTechnicalNoindex() {
    $file=Join-Path $Root 'technical-patterns/index.html'; $txt=[System.IO.File]::ReadAllText($file,[System.Text.Encoding]::UTF8)
    if ($txt -notmatch '<meta name="robots"') { $txt=$txt.Replace('<meta charset="utf-8">','<meta charset="utf-8">' + "`n" + '<meta name="robots" content="noindex,nofollow,noarchive">') }
    if ($txt -notmatch '<meta name="googlebot"') { $txt=$txt.Replace('<meta name="robots" content="noindex,nofollow,noarchive">','<meta name="robots" content="noindex,nofollow,noarchive">' + "`n" + '<meta name="googlebot" content="noindex,nofollow">') }
    Write-Utf8 $file $txt
}
function BuildSitemap($items,$categories,$baseSitemap,$dest,[bool]$preview) {
    $doc=New-Object System.Xml.XmlDocument
    $doc.XmlResolver=$null
    $doc.Load($baseSitemap)
    $root=$doc.DocumentElement
    if ($root.LocalName -ne 'urlset') {throw 'Invalid base sitemap.xml - expected urlset.'}
    $ns=$root.NamespaceURI
    $seen=[System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($node in @($root.ChildNodes)) {
        if ($node.LocalName -ne 'url') { continue }
        $locNode=$node.SelectSingleNode('*[local-name()="loc"]')
        if ($null -eq $locNode) {continue}
        $loc=[string]$locNode.InnerText
        if ($loc -match '^https://circleline\.co\.nz/products(?:/|$)') { [void]$root.RemoveChild($node);continue }
        [void]$seen.Add($loc)
    }
    # In preview mode the catalogue and demo pages have noindex: do not list them in the sitemap.
    $list=@()
    if (-not $preview) {
        $list+=($Base+'/products/')
        foreach($item in $items) { $list+= "$Base/products/part/$(Slug $item.product.code)/" }
        foreach($cat in $categories) { $list+= "$Base/products/custom/$(Slug $cat)/" }
    }
    foreach($loc in $list) {
        if (-not $seen.Add($loc)) {continue}
        $entry=$doc.CreateElement('url',$ns)
        $newLoc=$doc.CreateElement('loc',$ns);$newLoc.InnerText=$loc;[void]$entry.AppendChild($newLoc)
        $last=$doc.CreateElement('lastmod',$ns);$last.InnerText=[DateTime]::UtcNow.ToString('yyyy-MM-dd');[void]$entry.AppendChild($last)
        [void]$root.AppendChild($entry)
    }
    $destParent=Split-Path -Parent $dest
    if (-not (Test-Path $destParent)) {[void](New-Item -ItemType Directory -Path $destParent -Force)}
    $settings=New-Object System.Xml.XmlWriterSettings
    $settings.Indent=$true
    $settings.Encoding=$Utf8
    $settings.OmitXmlDeclaration=$false
    $writer=[System.Xml.XmlWriter]::Create($dest,$settings)
    try { $doc.Save($writer) } finally { $writer.Close() }
}
try {
    $catalog=Read-Json (Join-Path $Root 'catalog.json')
    $manifest=Read-Json (Join-Path $Root 'technical-patterns/patterns.json')
    $settingsFile=Join-Path $Root 'category-settings.json'
    $categorySettings=if(Test-Path $settingsFile -PathType Leaf){(Read-Json $settingsFile).categories}else{$null}
    $items=@()
    $enabledCategories=New-Object System.Collections.Generic.List[string]
    $allCategoryNames=@($catalog.categories | ForEach-Object { [string]$_.name })
    if ($null -ne $categorySettings) { $allCategoryNames+=@($categorySettings.PSObject.Properties | ForEach-Object { [string]$_.Name }) }
    foreach ($name in $allCategoryNames | Select-Object -Unique) {
        $disabled=$false
        if ($null -ne $categorySettings) {
            $setting=$categorySettings.PSObject.Properties | Where-Object { $_.Name -eq $name } | Select-Object -First 1
            if ($null -ne $setting -and $null -ne $setting.Value -and $setting.Value.enabled -eq $false) {$disabled=$true}
        }
        if (-not $disabled -and (Slug $name)) {[void]$enabledCategories.Add($name)}
    }
    foreach ($category in $catalog.categories) {
        if($null -ne $categorySettings){
            $setting=$categorySettings.PSObject.Properties | Where-Object { $_.Name -eq [string]$category.name } | Select-Object -First 1
            if($null -ne $setting -and $null -ne $setting.Value -and $setting.Value.enabled -eq $false){
                Write-Host ('Skipping disabled category: ' + [string]$category.name) -ForegroundColor Yellow
                continue
            }
        }
        foreach ($p in $category.products) {
            if ((Text $p.code).Trim() -and (Text $p.name).Trim()) {
                $items+=,[pscustomobject]@{category=[string]$category.name;product=$p}
            }
        }
    }
    # Zero published items is valid when all categories are disabled or contain no listings.
    # Custom category requests remain available through category-settings.json.
    $codes=[System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    $slugs=[System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach($item in $items) {
        $code=[string]$item.product.code
        $slug=Slug $code
        if (-not $codes.Add($code)) {throw "Duplicate code in catalog.json: $code"}
        if (-not $slug -or -not $slugs.Add($slug)) {throw "Empty or duplicate URL slug for: $code"}
    }
    $sourceSitemap=if ($BaseSitemap) {$BaseSitemap} else {Join-Path $PackageRoot 'sitemap.xml'}
    if (-not [System.IO.Path]::IsPathRooted($sourceSitemap)) { $sourceSitemap=Join-Path (Get-Location).Path $sourceSitemap }
    if (-not (Test-Path $sourceSitemap -PathType Leaf)) {throw "Root sitemap.xml not found at $sourceSitemap. Put products/ beside the website index.html and sitemap.xml, then retry."}
    if (-not (Test-Path (Join-Path $Root 'seo-product-template.tpl'))) {throw 'Missing seo-product-template.tpl.'}
    $template=[System.IO.File]::ReadAllText((Join-Path $Root 'seo-product-template.tpl'),[System.Text.Encoding]::UTF8)
    foreach ($item in $items) {
        $f=Get-Fields $item.product
        $match=PatternFor $manifest $f.technical $f.dimensions
        if ($null -ne $match) {
            foreach ($view in $match.views) {
                $svgPath=Join-Path (Join-Path $Root 'technical-patterns') $view.file
                if (-not (Test-Path $svgPath -PathType Leaf)) {throw "Missing SVG in technical-patterns: $($view.file)"}
            }
        }
    }
    # Confirm DEMO publication before ANY site files are modified.
    # This prompt is also enforced when the PowerShell script is invoked directly.
    $demoCodes=@($items | Where-Object {
        ([string]$_.product.code).StartsWith('CL-DEMO',[System.StringComparison]::OrdinalIgnoreCase)
    } | ForEach-Object { [string]$_.product.code })
    if ($Publish -and $demoCodes.Count -gt 0) {
        Write-Host ''
        Write-Host '========================================================' -ForegroundColor Yellow
        Write-Host ' WARNING - DEMONSTRATION PRODUCTS IN LIVE PUBLICATION' -ForegroundColor Yellow
        Write-Host '========================================================' -ForegroundColor Yellow
        Write-Host ("Found {0} CL-DEMO product(s) in catalog.json." -f $demoCodes.Count) -ForegroundColor Yellow
        Write-Host 'Continuing WILL set the catalogue and product pages to index,follow.' -ForegroundColor Yellow
        Write-Host 'Continuing WILL put these DEMO URLs in the REAL root sitemap.xml.' -ForegroundColor Yellow
        Write-Host 'Search engines MAY index demonstration products and show them publicly.' -ForegroundColor Yellow
        Write-Host 'The generated product pages will display a demo notice.' -ForegroundColor Yellow
        Write-Host ''
        $approval=Read-Host 'To confirm LIVE publication with demo products, type PUBLISH DEMO'
        if (([string]$approval).Trim() -ine 'PUBLISH DEMO') {
            throw 'Publication cancelled. Demo products were not approved.'
        }
        Write-Host 'Demo publication explicitly confirmed. Continuing...' -ForegroundColor Yellow
    }
    $stage=Join-Path $Root '_part_build_temp'
    if (Test-Path $stage) {throw 'Temporary folder _part_build_temp already exists. Please remove it manually after checking its contents.'}
    [void](New-Item -ItemType Directory -Path $stage)
    $preview=(-not [bool]$Publish)
    foreach($item in $items) {
        $page=RenderPage $item.category $item.product $manifest $template $preview
        $path=Join-Path (Join-Path $stage (Slug $item.product.code)) 'index.html'
        Write-Utf8 $path $page
    }
    $customStage=Join-Path $Root '_custom_build_temp'
    if (Test-Path $customStage) {throw 'Temporary folder _custom_build_temp already exists. Inspect or remove it manually before retrying.'}
    [void](New-Item -ItemType Directory -Path $customStage)
    $catalogueSource=[System.IO.File]::ReadAllText((Join-Path $Root 'index.html'),[System.Text.Encoding]::UTF8)
    foreach($categoryName in $enabledCategories) {
        $customPage=RenderCustomPage $categoryName $catalogueSource $preview
        Write-Utf8 (Join-Path (Join-Path $customStage (Slug $categoryName)) 'index.html') $customPage
    }
    # First validate new sitemap before replacing generated pages.
    $tempSitemap=Join-Path $PackageRoot '__sitemap_generated_temp.xml'
    if (Test-Path $tempSitemap) {throw 'Temporary sitemap exists. Remove __sitemap_generated_temp.xml after checking it.'}
    BuildSitemap $items $enabledCategories $sourceSitemap $tempSitemap $preview
    $old=Join-Path $Root 'part'
    $backup=Join-Path $Root '_part_previous_temp'
    if (Test-Path $backup) {throw 'Temporary backup folder _part_previous_temp already exists. Please inspect it manually.'}
    if (Test-Path $old) {Move-Item $old $backup}
    Move-Item $stage $old
    $oldCustom=Join-Path $Root 'custom'
    $customBackup=Join-Path $Root '_custom_previous_temp'
    if (Test-Path $customBackup) {throw 'Temporary backup folder _custom_previous_temp already exists. Inspect it manually.'}
    if (Test-Path $oldCustom) {Move-Item $oldCustom $customBackup}
    Move-Item $customStage $oldCustom
    UpdateCatalogue $items $preview
    UpdateTechnicalNoindex
    Move-Item -Path $tempSitemap -Destination (Join-Path $PackageRoot 'sitemap.xml') -Force
    if (Test-Path $backup) {Remove-Item $backup -Recurse -Force}
    if (Test-Path $customBackup) {Remove-Item $customBackup -Recurse -Force}
    $mode=if ($preview) {'PREVIEW (noindex)'}elseif ($demoCodes.Count -gt 0) {'PUBLICATION WITH DEMO PRODUCTS (index,follow)'}else{'PUBLICATION (index,follow)'}
    Write-Host ''
    Write-Host "SUCCESS: $($items.Count) product pages and $($enabledCategories.Count) custom category pages generated in $mode mode." -ForegroundColor Green
    Write-Host "Updated sitemap: $(Join-Path $PackageRoot 'sitemap.xml')"
    Write-Host 'All files were updated locally. Upload/deploy is a separate step.'
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'No files were uploaded. Review the error before rerunning.'
    exit 1
}
