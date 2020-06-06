function CatalogItem(id, name, connectors, svg) {
    function matrix(x, y, a) {
	return (new DOMMatrix()).translateSelf(x, y).rotateSelf(a);
    }

    this.id = id;
    this.name = name;
    this.connectors = connectors;
    let svg2 = connectors.map((c) => '<use href="#connector" transform="' + matrix(c[0], c[1], -c[2]) + '" />').join('');
    this.svg = svg + svg2;
}

function Catalog() {
    this.items = [

	/* Märklin M track */

	new CatalogItem(
	    '5106',
	    'Gerade 1/1 180mm (auch 5106)',
	    [[ 0.0, 0.0, 180.0 ], [ 180.0, 0.0, 0.0 ]],
	    '<path d="M 0 0 L 180 0" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5107',
	    'Gerade 1/2 90mm',
	    [[ 0.0, 0.0, 180.0 ], [ 90.0, 0.0, 0.0 ]],
	    '<path d="M 0 0 L 90 0" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5108',
	    'Gleisstück gerade 1/4 45mm',
	    [[ 0.0, 0.0, 180.0 ], [ 45.0, 0.0, 0.0 ]],
	    '<path d="M 0 0 L 45 0" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5109',
	    'Gleisstück gerade 3/16 33,5mm',
	    [[ 0.0, 0.0, 180.0 ], [ 33.5, 0.0, 0.0 ]],
	    '<path d="M 0 0 L 33.5 0" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5110',
	    'Gleisstück gerade 1/8 22,5mm',
	    [[ 0.0, 0.0, 180.0 ], [ 22.5, 0.0, 0.0 ]],
	    '<path d="M 0 0 L 22.5 0" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5129',
	    'Gleisstück gerade 70mm',
	    [[ 0.0, 0.0, 180.0 ], [ 70, 0.0, 0.0 ]],
	    '<path d="M 0 0 L 70 0" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5210',
	    'Gleisstück gerade 16mm',
	    [[ 0.0, 0.0, 180.0 ], [ 16, 0.0, 0.0 ]],
	    '<path d="M 0 0 L 16 0" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5208',
	    'Gleisstück gerade 8mm',
	    [[ 0.0, 0.0, 180.0 ], [ 8, 0.0, 0.0 ]],
	    '<path d="M 0 0 L 8 0" fill="none" stroke="black" stroke-width="16.5" />'),

	/* -- Normalkreis -- */
	new CatalogItem(
	    '5100',
	    'Normalkreis 1/1 30° (R=360)',
	    [[ -93.17, 12.27, 180+15 ], [ 93.17, 12.27, -15 ]],
	    '<path d="M -93.17 12.27 A 360 360 30 0 1 93.17 12.27" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5101',
	    'Normalkreis 1/2 15° (R=360)',
	    [[ -47, 3.08, 180+7.5 ], [ 47, 3.08, -7.5 ]],
	    '<path d="M -47 3.08 A 360 360 15 0 1 47 3.08" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5102',
	    'Normalkreis 1/4 7,5° (R=360)',
	    [[ -20.4, 0.58, 180+3.25 ], [ 20.4, 0.58, -3.25 ]],
	    '<path d="M -20.4 0.58 A 360 360 15 0 1 20.4 0.58" fill="none" stroke="black" stroke-width="16.5" />'),

	/* -- Industriekreis -- */
	new CatalogItem(
	    '5120',
	    'Industriekreis 1/1 45° (R=286)',
	    [[ -109.45, 10.89, 180+22.5 ], [ 109.45, 10.89, -22.5 ]],
	    '<path d="M -109.45 10.89 A 286 286 45 0 1 109.45 10.89" fill="none" stroke="black" stroke-width="16.5" />'),

	/* -- Großer Parallelkreis -- */
	new CatalogItem(
	    '5200',
	    'Großer Parallelkreis 1/1 30° (R=437,4)',
	    [[ -113.2, 14.9, 180+15 ], [ 113.2, 14.9, -15 ]],
	    '<path d="M -113.2 14.9 A 437.4 437.4 30 0 1 113.2 14.9" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5206',
	    'Großer Parallelkreis 5/6 24.3° (R=437,4)',
	    [[ -92, 9.8, 180+12.14 ], [ 92, 9.8, -12.14 ]],
	    '<path d="M -92 9.8 A 437.4 437.4 24.3 0 1 92 9.8" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5201',
	    'Großer Parallelkreis 1/2 15° (R=437,4)',
	    [[ -57.1, 3.74, 180+7.5 ], [ 57.1, 3.74, -7.5 ]],
	    '<path d="M -57.1 3.74 A 437.4 437.4 15 0 1 57.1 3.74" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5205',
	    'Großer Parallelkreis 1/6 5,7° (R=437,4)',
	    [[ -21.82, 0.54, 180+2.86 ], [ 21.82, 0.54, -2.86 ]],
	    '<path d="M -21.82 0.54 A 437.4 437.4 5.7 0 1 21.82 0.54" fill="none" stroke="black" stroke-width="16.5" />'),

	/* -- Weichen / Kreuzung -- */
	new CatalogItem(
	    '5117L',
	    'Weiche (links)',
	    [[ 0.0, 0.0, 180.0 ], [ 180.0, 0.0, 0.0 ], [ 180.0, -48.23, 30.0 ]],
	    '<path d="M 180 0 L 0 0 A 360 360 30 0 0 180.0 -48.23" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5117R',
	    'Weiche (rechts)',
	    [[ 0.0, 0.0, 180.0 ], [ 180.0, 0.0, 0.0 ], [ 180.0, 48.23, -30.0 ]],
	    '<path d="M 180 0 L 0 0 A 360 360 30 0 1 180.0 48.23" fill="none" stroke="black" stroke-width="16.5" />'),

	new CatalogItem(
	    '5137L',
	    'Kurze Weiche (links)',
	    [[ 0.0, 0.0, 180.0 ], [ 180.0, 0.0, 0.0 ], [ 137.77, -27.4, 22.5 ]],
	    '<path d="M 180 0 L 0 0 A 360 360 22.5 0 0 137.77 -27.4" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5137R',
	    'Kurze Weiche (rechts)',
	    [[ 0.0, 0.0, 180.0 ], [ 180.0, 0.0, 0.0 ], [ 137.77, 27.4, -22.5 ]],
	    '<path d="M 180 0 L 0 0 A 360 360 22.5 0 1 137.77 27.4" fill="none" stroke="black" stroke-width="16.5" />'),

	new CatalogItem(
	    '5202L',
	    'Weiche (links) (R=437,4)',
	    [[ 0.0, 0.0, 180.0 ], [ 180.0, 0.0, 0.0 ], [ 180.0, -38.75, 24.3 ]],
	    '<path d="M 180 0 L 0 0 A 437.4 437.4 24.3 0 0 180.0 -38.75" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5202R',
	    'Weiche (rechts) (R=437,4)',
	    [[ 0.0, 0.0, 180.0 ], [ 180.0, 0.0, 0.0 ], [ 180.0, 38.75, -24.3 ]],
	    '<path d="M 180 0 L 0 0 A 437.4 437.4 24.3 0 1 180.0 38.75" fill="none" stroke="black" stroke-width="16.5" />'),

	/* -- Bogenweichen -- */
    	new CatalogItem(
	    '5140L',
	    'Bogenweiche (links)',
	    [[ 0.0, 0.0, 180.0 ], [ 180, -48.23, 30 ], [ 257.4, -48.23, 30.0 ]],
	    '<path d="M 0 0 A 360 360 30 0 0 180 -48.23 M 0 0 L 77.4 0 A 360 360 30 0 0 257.4 -48.23" fill="none" stroke="black" stroke-width="16.5" />'),
    	new CatalogItem(
	    '5140R',
	    'Bogenweiche (rechts)',
	    [[ 0.0, 0.0, 180.0 ], [ 180, 48.23, -30 ], [ 257.4, 48.23, -30.0 ]],
	    '<path d="M 0 0 A 360 360 30 0 1 180 48.23 M 0 0 L 77.4 0 A 360 360 30 0 1 257.4 48.23" fill="none" stroke="black" stroke-width="16.5" />'),

	/* -- Dreifachweiche -- */
        new CatalogItem(
	    '5214',
	    'Dreifachweiche (R=437,4)',
	    [[ 0.0, 0.0, 180.0 ], [ 180.0, 0.0, 0.0 ], [ 180.0, -38.75, 24.3 ], [ 180.0, 38.75, -24.3 ]],
	    '<path d="M 180 0 L 0 0 A 437.4 437.4 24.3 0 0 180.0 -38.75 M 0 0 A 437.4 437.4 24.3 0 1 180.0 38.75" fill="none" stroke="black" stroke-width="16.5" />'),

	/* -- Kreuzungen -- */
	new CatalogItem(
	    '5128',
	    'Doppelte Kreuzungsweiche 30° (auch 5114)',
	    [[ -93.21, -24.976, 180-15 ], [ 93.21, -24.976, 15 ], [ -93.21, 24.976, 180+15 ], [ 93.21, 24.976, -15 ]],
	    '<path d="M -93.21 -24.976 L 93.21 24.976 M -93.21 24.976 L 93.21 -24.976" fill="none" stroke="black" stroke-width="16.5" />'),
	new CatalogItem(
	    '5207',
	    'Doppelte Kreuzungsweiche 23,3°',
	    [[ -88.15, -18.15, 180-11.63 ], [ 88.15, -18.15, 11.63 ], [ -88.15, 18.15, 180+11.63 ], [ 88.15, 18.15, -11.63 ]],
	    '<path d="M -88.15 -18.15 L 88.15 18.15 M -88.15 18.15 L 88.15 -18.15" fill="none" stroke="black" stroke-width="16.5" />'),


	/* -- Rest -- */
    	new CatalogItem(
	    '7190',
	    'Prellbock',
	    [[ 0.0, 0.0, 180.0 ]],
	    '<path d="M 0 0 H 70" fill="none" stroke="black" stroke-width="16.5" />' +
		'<path d="M 50 -16 H 60 A 8 8 0 0 1 68 -8 V 8 A 8 8 0 0 1 60 16 H 50" fill="none" stroke="black" stroke-width="4" />'
	    //'<path d="M 50 -16 H 70 V 16 H 50" fill="none" stroke="black" stroke-width="4" />'
	    // '<path d="M 0 0 H 70" fill="none" stroke="black" stroke-width="16.5" />' +
	    // 	'<path d="M 50 -20 V 20 M 50 -14 h -15 M 50 14 h -15" fill="none" stroke="black" stroke-width="4" />' +
	    // 	'<path d="M 35 -14 h 3 M 35 14 h 3" fill="none" stroke="black" stroke-width="8" />'
	),

    ];

}

Catalog.prototype.all = function() {
    return this.items;
}

Catalog.prototype.find = function(id) {
    return this.items.find((i) => i.id == id);
}
