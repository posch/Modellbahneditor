/* -- part -- */

function Part(partId, catalogItem, x, y, a) {
    this.id = partId;
    this.catalogItem = catalogItem;
    this.move(x, y, a);
}

Part.prototype.getTransformMatrix = function() {
    return (new DOMMatrix()).translateSelf(this.x, this.y).rotateSelf(-this.a);
}

Part.prototype.move = function(x, y, a) {
    this.x = x;
    this.y = y;
    this.a = a % 360;
    this.m = this.getTransformMatrix();
}

Part.prototype.getTransformedConnector = function(connectorIndex) {
    function transform(m, x, y, a) {
	return [ m.a * x + m.c * y + m.e,
		 m.b * x + m.d * y + m.f,
		 a ];
    }
    const c = this.catalogItem.connectors[connectorIndex];
    return transform(this.m, c[0], c[1], this.a + c[2]);
}

Part.prototype.getTransformedConnectors = function() {
    return this.catalogItem.connectors.map((c, i) => this.getTransformedConnector(i));
}

/* Move part such that the specified connector is at position (x,y)
   with angle a.
*/
Part.prototype.connect = function(connectorIndex, x, y, a) {
    const c = this.catalogItem.connectors[connectorIndex];
    const a_new = a + 180 - c[2];  /* this.a + c[2] == a + 180 */
    this.move(this.x, this.y, a_new);
    const pos = this.getTransformedConnector(connectorIndex);
    this.move(this.x + (x - pos[0]), this.y + (y - pos[1]), this.a);
}

/* -- model -- */

function Model() {
    this.observers = new Set();
    this.catalog = new Catalog();
    this.clear();
}

Model.prototype.clear = function() {
    this.nextPartId = 1;
    this.width = 2000;
    this.height = 1000;
    this.parts = new Map();
    this.selection = new Set();
    this.zoom = 0;
}

// Observers. No need for "detach", yet.

Model.prototype.attach = function(f) {
    this.observers.add(f);
    return f;
}
Model.prototype.notify = function(x) {
    this.observers.forEach((f) => f(x));
}


/* -- create -- */

Model.prototype._createPart = function(catalogItem, x, y, a) {
    let partId = this.nextPartId++;
    let part = new Part(partId, catalogItem, x, y, a);
    this.parts.set(partId, part);
    return part;
}

Model.prototype._clonePart = function(orig) {
    let partId = this.nextPartId++;
    let part = new Part(partId,
			orig.catalogItem,
			orig.x, orig.y, orig.a)
    this.parts.set(partId, part);
    return part;
}

Model.prototype.addPart = function(catalogId, x, y, a) {
    let catalogItem = this.catalog.find(catalogId);
    if (catalogItem) {
	let part = this._createPart(catalogItem, x, y, a);
	//console.log("addPart", "OK", part);
	this.notify();
	return part;
    } else {
	console.log("addPart", "Not-Found", catalogId);
	return undefined;
    }
}

/* -- kill -- */

Model.prototype._delPart = function(part) {
    this.parts.delete(part.id);
}

Model.prototype.allParts = function() {
    return this.parts.values();
}

Model.prototype.findPart = function(partId) {
    let part = this.parts.get(partId);
    if (!part) {
	console.log("findPart", "not-found", partId);
    }
    return part;
}

Model.prototype.connectPart = function(partId, connectorIndex, x, y, a) {
    let part = this.parts.get(partId);
    part.connect(connectorIndex, x, y, a);
    this.notify();
}

Model.prototype.movePart = function(partId, x, y, a) {
    let part = this.parts.get(partId);
    if (part) {
	//console.log("movePart", "OK", partId, x, y, a);
	part.move(x, y, a);
	this.notify();
    } else {
	console.log("movePart", "not-found", partId, x, y, a);
	return undefined;
    }
}

Model.prototype.deletePart = function(partId) {
    if (this.parts.delete(partId)) {
	//console.log("deletePart", partId, "OK");
	this.notify();
    } else {
	consoe.log("deletePart", partId, "Not-Found");
    }
}



// Editor

Model.prototype.setZoom = function(value) {
    this.zoom = value;
    this.notify();
}

Model.prototype.setWidth = function(value) {
    this.width = value;
    this.notify();
}

Model.prototype.setHeight = function(value) {
    this.height = value;
    this.notify();
}

/* -- Move action -- */

Model.prototype.cancelMoving = function() {
    if (this.moving) {
	//console.log("cancelMoving", this.moving);
	for (let part of this.allParts()) {
	    part.x = part.startx;
	    part.y = part.starty;
	    part.a = part.starta;
	}
	this.moving = null;
	this.notify();
    }
}

Model.prototype._centerMoving = function() {
    const center = this.centerOfSelection();
    const offx = this.moving.x - center[0];
    const offy = this.moving.y - center[1];
    this.moving.startx -= offx;
    this.moving.starty -= offy;
}

Model.prototype.startMoving = function(x, y) {
    for (let part of this.allParts()) {
	part.startx = part.x;
	part.starty = part.y;
	part.starta = part.a;
    }
    /* When selecting and moving only a part of connected component
       (i.e. when splitting a connected component in two), connectors
       become open, that are not open now. So we need to search for
       connectors that are either unconnected, or connect a selected
       and an unselected part. We can find them in the the graph of
       connected parts.
    */
    let selectedConnectors = this.getSelectedConnectors();
    this.matchConnectors(selectedConnectors, selectedConnectors);
    let unselectedConnectors = this.getUnselectedConnectors();
    this.matchConnectors(unselectedConnectors, unselectedConnectors);
    this.moving = {
	x: x,
	y: y,
	a: 0,
	startx: x,
	starty: y,
	otherConnectors: unselectedConnectors.filter((c) => c.matches.length == 0),
	selectedConnectors: selectedConnectors.filter((c) => c.matches.length == 0),
    };
    //console.log('moving', this.moving);
    this._updateMoving();
}

Model.prototype.stopMoving = function() {
    this.moving = null;
    this.notify();
}

Model.prototype.updateMovingPos = function(x, y) {
    this.moving.x = x;
    this.moving.y = y;
    this._updateMoving();
}

Model.prototype.updateMovingRotate = function(a) {
    this.moving.a = (this.moving.a + a) % 360;
    this._updateMoving();
}

// Change moving.{startx,starty} such that the current mouse position
// (x,y) becomes the center of the moving parts.
Model.prototype.updateMovingCenter = function(x, y) {
    if (this.moving) {
	let l, r, t, b;
	let n = 0;
	for (let part of this.allParts()) {
	    if (part.selected) {
		for (let c of part.getTransformedConnectors()) {
		    if (n == 0) {
			l = r = c[0];
			t = b = c[1];
		    } else {
			l = Math.min(l, c[0]);
			r = Math.max(r, c[0]);
			t = Math.min(t, c[1]);
			b = Math.max(b, c[1]);
		    }
		    n += 1;
		}
	    }
	}
	if (n > 0) {
	    let cx = (l+r)/2;
	    let cy = (t+b)/2;
	    let offx = cx - x;
	    let offy = cy - y;
	    this.moving.startx += offx;
	    this.moving.starty += offy;
	    this._updateMoving();
	}
    }
}

Model.prototype.getConnectors = function(p) {
    // return connectors that satisfy predicate function p
    let cs = [];
    for (let part of this.allParts()) {
	if (p(part)) {
	    let connectorsOfThisPart = part.getTransformedConnectors().map(
		(pos, i) => ({ partId: part.id,
			       part: part,
			       index: i,
			       pos: pos,
			       matches: []}));
	    for (c of connectorsOfThisPart) {
		c.connectorsOfThisPart = connectorsOfThisPart;
		cs.push(c);
	    }
	}
    }
    return cs;
}

Model.prototype.getSelectedConnectors = function() {
    return this.getConnectors((p) => p.selected);
}

Model.prototype.getUnselectedConnectors = function() {
    return this.getConnectors((p) => !p.selected);
}

/* Given the sets as and bs of connectors (may be the same sets), find
 * all matching connectors.
 */
Model.prototype.matchConnectors = function(as, bs) {
    function match(a, b) {
	/* Two connectors "match" if they are close and have matching angles. */
	const dx = Math.abs(b.pos[0] - a.pos[0]);
	const dy = Math.abs(b.pos[1] - a.pos[1]);
	const da = Math.abs(Math.abs((b.pos[2] - a.pos[2])) % 360 - 180);
	return b.partId != a.partId && dx < 3 && dy < 3 && da < 3;
    }
    for (let a of as) {
	for (let b of bs) {
	    if (match(a, b)) {
		a.matches.push(b);
	    }
	}
    }
}

// Find the nearest connector to snap to.
Model.prototype._updateMovingNearestConnector = function() {
    for (let c of this.moving.selectedConnectors) {
	// Update position of moving connectors
	c.pos = c.part.getTransformedConnector(c.index);
    }

    function dist(a, b) {
	const dx = a.pos[0] - b.pos[0];
	const dy = a.pos[1] - b.pos[1];
	return dx*dx + dy*dy;
    }

    let nearestSelected = null;
    let nearestOther = null;
    let nearestDist = Math.inf;
    for (let c of this.moving.selectedConnectors) {
	for (let other of this.moving.otherConnectors) {
	    let d = dist(c, other);
	    if (!nearestSelected || d < nearestDist) {
		nearestSelected = c;
		nearestOther = other;
		nearestDist = d;
	    }
	}
    }
    if (nearestOther) {
	this.moving.nearestConnector = {
	    partId: nearestSelected.partId,
	    connectorIndex: nearestSelected.index,
	    connectorPos: nearestSelected.pos,
	    otherPartId: nearestOther.partId,
	    otherConnectorIndex: nearestOther.index,
	    otherConnectorPos: nearestOther.pos,
	};
    } else {
	this.moving.nearestConnector = null;
    }
}

Model.prototype._updateMoving = function() {
    const a = this.moving.a;
    let m = new DOMMatrix();
    m.translateSelf(this.moving.x, this.moving.y).rotateSelf(-a);
    let p = new DOMPoint();
    for (let part of this.allParts()) {
	if (part.selected) {
	    p.x = part.startx - this.moving.startx;
	    p.y = part.starty - this.moving.starty;
	    let q = m.transformPoint(p);
	    part.move(q.x, q.y, part.starta + a);
	}
    }
    this._updateMovingNearestConnector();
    this.notify();
}


/* -- select -- */

Model.prototype._select = function(part) {
    //console.log("_select", part);
    part.selected = true;
    part.startx = part.x;
    part.starty = part.y;
    part.starta = part.a;
}

Model.prototype._unselect = function(part) {
    //console.log("_unselect", part);
    part.selected = false;
}

Model.prototype.clearSelection = function() {
    //console.log("Model.clearSelection", partId);
    for (let part of this.allParts()) {
	this._unselect(part);
    }
    this.notify();
}

Model.prototype.selectFirst = function(partId) {
    //console.log("Model.selectFirst", partId);
    for (let part of this.allParts()) {
	if (part.id == partId) {
	    this._select(part);
	} else {
	    this._unselect(part);
	}
    }
    this.notify();
}

Model.prototype.selectToggle = function(partId) {
    //console.log("Model.selectToggle", partId);
    let part = this.findPart(partId);
    if (!part) {
	console.log("selectAdd", "part not found", partId);
	return;
    }
    if (part.selected) {
	this._unselect(part);
    } else {
	this._select(part);
    }
    this.notify();
}

Model.prototype.selectConnected = function() {
    let unselectedConnectors = this.getUnselectedConnectors();
    this.matchConnectors(unselectedConnectors, unselectedConnectors);
    let q = this.getSelectedConnectors();
    this.matchConnectors(q, unselectedConnectors);
    while (q.length > 0) {
	//console.log('q', q.length);
	let c = q.pop();
	//console.log('c', c);
	for (other of c.matches) {
	    if (!other.part.selected) {
		other.part.selected = true;
		for (let otherc of other.connectorsOfThisPart) {
		    //console.log('otherc', otherc);
		    q.push(otherc);
		}
	    }
	}
    }
    this.notify();
}

Model.prototype.selectConnectedNeigh = function() {
    let selectedConnectors = this.getSelectedConnectors();
    //console.log('selectedConnectors', selectedConnectors);
    let unselectedConnectors = this.getUnselectedConnectors();
    //console.log('unselectedConnectors', unselectedConnectors);
    this.matchConnectors(selectedConnectors, unselectedConnectors);
    for (let c of selectedConnectors) {
	//console.log('c', c);
	for (let other of c.matches) {
	    //console.log('other', other);
	    if (!other.part.selected) {
		other.part.selected = true;
	    }
	}
    }
    this.notify();
}

Model.prototype.centerOfSelection = function() {
    let sumx = 0;
    let sumy = 0;
    let n = 0;
    for (const part of this.allParts()) {
	if (part.selected) {
	    for (const c of part.getTransformedConnectors()) {
		sumx += c[0];
		sumy += c[1];
		n++;
	    }
	}
    }
    if (n > 0) {
	//console.log("centerOfSelection", sumx/n, sumy/n);
	return [ sumx/n, sumy/n ];
    } else {
	return [0,0];
    }
}

Model.prototype.dupSelection = function() {
    for (let orig of this.allParts()) {
	if (orig.selected) {
	    this._clonePart(orig);
	}
    }
    this.notify();
}

Model.prototype.delSelection = function() {
    for (let part of this.allParts()) {
	if (part.selected) {
	    this._delPart(part);
	}
    }
    this.stopMoving();
}



/* -- ruler -- */

Model.prototype.toggleRuler = function(x, y) {
    if (this.ruler) {
	this.hideRuler();
    } else {
	this.showRuler(x, y);
    }
}

Model.prototype.showRuler = function(x, y) {
    this.ruler = {
	startx: x,
	starty: y,
    };
    this.notify();
}

Model.prototype.hideRuler = function() {
    if (this.ruler) {
	this.ruler = null;
	this.notify();
    }
}



/* -- local storage -- */

Model.prototype.setLocalStorageIndex = function(i) {
    localStorage.setItem('index', i);
}

Model.prototype.getLocalStorageIndex = function() {
    let raw = localStorage.getItem('index');
    if (raw) {
	return parseInt(raw);
    } else {
	return 1;
    }
}

Model.prototype.loadLocalStorage = function(i) {
    const s = localStorage.getItem(`${i}.data`);
    if (s) {
	const data = JSON.parse(s);
	//console.log('load', 'data', data);
	this.width = data.width;
	this.height = data.height;
	this.zoom = data.zoom;
	this.parts.clear();
	for (const part of data.parts) {
	    //console.log("load", "part", part);
	    this.addPart(part.catalogId, part.x, part.y, part.a);
	}
    } else {
	this.clear();
    }
    this.setLocalStorageIndex(i);
    this.notify();
}

Model.prototype.getLocalStorageNames = function() {
    let names = new Array(9);
    for (let i = 1; i <= 9; ++i) {
	names[i] = localStorage.getItem(`${i}.name`);
    }
    return names;
}

Model.prototype.setLocalStorageName = function(i, name) {
    localStorage.setItem(`${i}.name`, name);
}

Model.prototype.storeLocalStorage = function(i) {
    let parts = [];
    for (let part of this.allParts()) {
	parts.push({ catalogId: part.catalogItem.id,
		     x: part.x,
		     y: part.y,
		     a: part.a,
		   });
    }
    let data = {
	width: this.width,
	height: this.height,
	zoom: this.zoom,
	parts: parts,
    };
    //console.log('save', 'data', data);
    localStorage.setItem(`${i}.data`, JSON.stringify(data));
    this.setLocalStorageIndex(i);
}

Model.prototype.save = function() {
    const i = this.getLocalStorageIndex();
    this.storeLocalStorage(i);
}

Model.prototype.load = function() {
    const i = this.getLocalStorageIndex();
    this.loadLocalStorage(i);
}

Model.prototype.delLocalStorage = function(i) {
    localStorage.removeItem(`${i}.name`);
    localStorage.removeItem(`${i}.data`);
}

