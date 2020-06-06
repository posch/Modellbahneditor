/* -- Bill of material -- */

function BomDialogAction(model, view, controller) {
    this.model = model;
    this.view = view;
    this.controller = controller;

    this.dialogElement = document.querySelector('#BomDialog');
    this.dialogElement.querySelector('.dialogCloseButton').addEventListener(
	'click', (event) => this.controller.finishAction());

    this.show = () => { this.dialogElement.style.display = 'block'; this.update(); }
    this.hide = () => { this.dialogElement.style.display = 'none'; }

    this.computeBillOfMaterial = () => {
	let parts = this.model.allParts();
	let counters = new Map();
	for (let part of parts) {
	    let catalogId = part.catalogItem.id;
	    let counter = counters.get(catalogId);
	    if (counter == undefined) {
		counters.set(catalogId, { catalogId: part.catalogItem.id, catalogItem: part.catalogItem, count: 1 });
	    } else {
		counter.count += 1;
	    }
	}
	return Array.from(counters.values()).sort((a, b) => a.catalogId.localeCompare(b.catalogId));
    }

    this.update = () => {
	let tbody = this.dialogElement.querySelector('tbody');
	while (tbody.firstChild) { tbody.removeChild(tbody.firstChild); }
	let bom = this.computeBillOfMaterial();
	for (let item of bom) {
	    let tdCount = document.createElement('td');
	    tdCount.classList.add('num');
	    tdCount.innerText = item.count;
	    let tdId = document.createElement('td');
	    tdId.innerText = item.catalogId;
	    let tdText = document.createElement('td');
	    tdText.innerText = item.catalogItem.name;
	    let tr = document.createElement('tr');
	    tr.appendChild(tdCount);
	    tr.appendChild(tdId);
	    tr.appendChild(tdText);
	    tbody.appendChild(tr);
	}
    }

    this.start = () => this.show();
    this.finish = () => this.hide();
    this.cancel = () => this.hide();
    this.mousemoveHandler = (x, y) => {}
    this.clickHandler = (part, x, y, shiftKey) => {}
    this.keydownHandler = (key) => {
	switch (key) {
	case 'Escape':
	case 'Enter':
	case ' ':
	case 'B':
	    this.controller.finishAction();
	    break;
	default:
	    this.controller.keydownHandler(key);
	    break;
	}
    }
}
