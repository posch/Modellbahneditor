
function View(model) {
    this.model = model;
    this.model.attach((x) => this.update(x));
    this.svgElement = document.querySelector("svg");
    this.containerElement = document.querySelector("svg .workspace");
    this.belowContainerElement = document.querySelector("svg .below");
    this.aboveContainerElement = document.querySelector("svg .above");


    this.sizeHandler = (w, h, z) => {};
    this.setSizeHandler = (f) => this.sizeHandler = f;
    this.notifySize = () => this.sizeHandler(10 * parseInt(this.widthControlElement.value),
					     10 * parseInt(this.heightControlElement.value),
					     parseInt(this.zoomControlElement.value));
    this.widthControlElement = document.querySelector('input[name="workspace_width"]');
    this.widthControlElement.addEventListener('change', (event) => this.notifySize());
    this.heightControlElement = document.querySelector('input[name="workspace_height"]');
    this.heightControlElement.addEventListener('change', (event) => this.notifySize());
    this.zoomControlElement = document.querySelector('input[name="workspace_zoom"]');
    this.zoomControlElement.addEventListener('change', (event) => this.notifySize());

    this.rulerDistanceElement = document.querySelector('#ruler_distance');
    this.currentPartElement = document.querySelector('#current_part');

    this.mousex = 0;
    this.mousey = 0;

    this.mousemoveHandler = () => {};
    this.setMousemoveHandler = (f) => this.mousemoveHandler = f;
    this.svgElement.addEventListener('mousemove', (event) => {
	const pt = getSvgEventPosition(this.svgElement, event);
	this.mousex = pt.x;
	this.mousey = pt.y;
	this.mousemoveHandler(pt.x, pt.y);
	this.updateRulerDistance();
    });

    this.clickHandler = () => {};
    this.setClickHandler = (f) => this.clickHandler = f;
    this.svgElement.addEventListener('click', (event) => {
	const pt = getSvgEventPosition(this.svgElement, event);
	this.clickHandler(null, pt.x, pt.y, event.shiftKey);
    });

    this.keydownHandler = () => {};
    this.setKeydownHandler = (f) => this.keydownHandler = f;
    document.addEventListener('keydown', (event) => this.keydownHandler(event.key));

    this.catalogElement = document.querySelector('div.catalog');
    this.catalogClickHandler = () => {};
    this.setCatalogClickHandler = (f) => this.catalogClickHandler = f;
    this._updateCatalog();

    this.buttonHandler = (cmd) => {};
    this.setButtonHandler = (f) => this.buttonHandler = f;
    document.querySelector('#helpDialogButton').addEventListener('click', (event) => this.buttonHandler('help'));
    document.querySelector('#loadButton').addEventListener('click', (event) => this.buttonHandler('load'));
    document.querySelector('#saveButton').addEventListener('click', (event) => this.buttonHandler('save'));
    document.querySelector('#storageDialogButton').addEventListener('click', (event) => this.buttonHandler('storage'));
}

function getSvgEventPosition(svg, event) {
    var pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}

View.prototype._updateCatalog = function() {
    const catalog = this.catalogElement;
    for (const item of this.model.catalog.all()) {
	const e = document.createElement('div');
	e.classList.add('catalogItem');
	const label = document.createElement('span');
	label.innerHTML = item.id + ' - ' + item.name;
	svg = createSvgElement('svg');
	svg.innerHTML = item.svg;
	e.appendChild(label);
	e.appendChild(svg);
	catalog.appendChild(e);
	let bbox = svg.getBBox();
	let viewBox = Math.floor(bbox.x - 10) + ' ' + Math.floor(bbox.y - 10) + ' ' + Math.ceil(bbox.width + 20) + ' ' + Math.ceil(bbox.height + 20);
	//console.log('viewBox', viewBox);
	svg.setAttribute('viewBox', viewBox);
	svg.setAttribute('width', Math.ceil(bbox.width));
	svg.setAttribute('height', Math.ceil(bbox.height));
	svg.style.width = '100%';
	e.addEventListener('click', (event) => {this.catalogClickHandler(item, event)});
    }
}

function createSvgElement(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
}

function createUseElement(href) {
    let e = createSvgElement('use');
    e.setAttribute('href', href);
    return e;
}

function matrix(x, y, a) {
    return (new DOMMatrix()).translateSelf(x, y).rotateSelf(-a);
}

View.prototype.updateNearest = function() {
    if (this.model.moving && this.model.moving.nearestConnector) {
	let add = (pos) => {
	    let g = createSvgElement('g');
	    g.innerHTML = '<use href="#snap-connector" />';
	    g.setAttribute('transform', matrix(pos[0], pos[1], pos[2]));
	    this.belowContainerElement.appendChild(g);
	}
	add(this.model.moving.nearestConnector.connectorPos);
	add(this.model.moving.nearestConnector.otherConnectorPos);
    }
}

View.prototype.updateCurrentPart = function(part) {
    //console.log('updateCurrentPart', part);
    this.currentPartElement.innerHTML = `${part.catalogItem.id} ${part.catalogItem.name}`;
}

View.prototype._updatePartElement = function(part, g) {
    g.setAttribute('transform', part.getTransformMatrix().toString());
    if (part.selected) {
	g.classList.add('selected');
    } else {
	g.classList.remove('selected');
    }
}

View.prototype._createPart = function(part) {
    let g = createSvgElement('g');
    g.classList.add('part');
    g.dataset.partId = part.id;
    g.innerHTML = part.catalogItem.svg;
    g.addEventListener('click', (event) => {
	const pt = getSvgEventPosition(this.svgElement, event);
	this.clickHandler(part, pt.x, pt.y, event.shiftKey)
	event.stopPropagation();
    });
    g.addEventListener('mouseover', (event) => {
	this.updateCurrentPart(part);
	event.stopPropagation();
    });
    this._updatePartElement(part, g);
    this.containerElement.appendChild(g);
}

View.prototype.updateRuler = function() {
    if (this.model.ruler) {
	//console.log('view', 'ruler', this.model.ruler);
	const cx = this.model.ruler.startx;
	const cy = this.model.ruler.starty;
	const w = this.model.width;
	const h = this.model.height;
	let container = this.aboveContainerElement;
	let e = createSvgElement('path');
	e.setAttribute('d', `M 0 ${cy} H ${w} M ${cx} 0 V ${h}`);
	e.setAttribute('stroke', 'red');
	e.setAttribute('stroke-width', '1');
	e.setAttribute('fill', 'none');
	container.appendChild(e);
    }
}

View.prototype.updateRulerDistance = function() {
    if (this.model.ruler) {
	const dx = this.mousex - this.model.ruler.startx;
	const dy = this.mousey - this.model.ruler.starty;
	const d = Math.sqrt(dx*dx + dy*dy);
	this.rulerDistanceElement.innerHTML = `dx=${dx.toFixed(2)} dy=${dy.toFixed(2)} d=${d.toFixed(2)}`;
    } else {
	this.rulerDistanceElement.innerHTML = '--';
    }
}

View.prototype.update = function(x) {
    //console.log("View.update", x);

    const container = this.containerElement;
    const mode  = this.model;

    function clear(e) {	while (e.firstChild) { e.removeChild(e.firstChild); } }
    clear(this.belowContainerElement);
    clear(this.aboveContainerElement);

    let k = Math.pow(1.1, model.zoom);
    this.svgElement.setAttribute('viewBox', '0 0 ' + model.width + ' ' + model.height);
    this.svgElement.setAttribute('width', model.width * k);
    this.svgElement.setAttribute('height', model.height * k);
    this.widthControlElement.value = model.width / 10;
    this.heightControlElement.value = model.height / 10;
    this.zoomControlElement.value = model.zoom;

    // shorter, but takes a lot more CPU
    // clear(container);
    // for (let p of this.model.allParts()) {
    // 	this._createPart(p);
    // }

    let elements = container.querySelectorAll('g.part').values();
    let parts = this.model.allParts();
    let e = elements.next();
    let p = parts.next();
    while (true) {
        if (p.done) {
            if (e.done) {
                break;
            } else {
                container.removeChild(e.value);
                e = elements.next();
            }
        } else {
            if (e.done) {
                this._createPart(p.value);
                p = parts.next();
            } else if (e.value.dataset.partId != p.value.id) {
                container.removeChild(e.value);
                e = elements.next();
            } else {
                this._updatePartElement(p.value, e.value);
                e = elements.next();
                p = parts.next();
            }
        }
    }

    this.updateNearest();
    this.updateRuler();
    this.updateRulerDistance();
}


