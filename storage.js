/* -- Speicherdialog -- */

function StorageDialogAction(model, view, controller, eventHandler) {
    this.model = model;
    this.view = view;
    this.controller = controller;
    this.eventHandler = eventHandler;

    this.dialogElement = document.querySelector('#StorageDialog');
    this.dialogElement.querySelector('.dialogCloseButton').addEventListener(
	'click', (event) => this.controller.finishAction());

    this.show = () => { this.dialogElement.style.display = 'block'; this.update(); }
    this.hide = () => { this.dialogElement.style.display = 'none'; }

    this.listEvent = function(type, index, name) {
	this.eventHandler({type:type, index:index, name:name});
	this.update();
    }
    this.update = () => {
	let table = this.dialogElement.querySelector('table');
	while (table.firstChild) { table.removeChild(table.firstChild); }
	function createButton(value, clickHandler) {
	    let e = document.createElement('input');
	    e.setAttribute('type', 'button');
	    e.setAttribute('value', value);
	    e.addEventListener(
		'click', clickHandler);
	    return e;
	}
	const current = this.model.getLocalStorageIndex();
	const names = this.model.getLocalStorageNames();
	for (let i in names) {
	    let nameInput = document.createElement('input');
	    nameInput.setAttribute('type', 'text');
	    nameInput.setAttribute('value', names[i] ? names[i] : `${i}`);
	    let nameCol = document.createElement('td');
	    nameCol.appendChild(nameInput);
	    let controlsCol = document.createElement('td');
	    controlsCol.appendChild(createButton('Laden', () => this.listEvent('loadSlot', i, nameInput.value)));
	    controlsCol.appendChild(createButton('Speichern', () => this.listEvent('storeSlot', i, nameInput.value)));
	    controlsCol.appendChild(createButton('Löschen', () => this.listEvent('delSlot', i, nameInput.value)));
	    let tr = document.createElement('tr');
	    if (i == current) {
		tr.classList.add('current');
	    }
	    tr.appendChild(nameCol);
	    tr.appendChild(controlsCol);
	    table.appendChild(tr);
	}
    }

    this.start = () => this.show();
    this.finish = () => this.hide();
    this.cancel = () => this.hide();
    this.mousemoveHandler = (x, y) => {}
    this.clickHandler = (part, x, y, shiftKey) => {}
    this.keydownHandler = (key) => {}
}

