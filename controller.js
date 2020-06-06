/* -- Selektieren -- */

function SelectMode(model, view, controller) {
    this.model = model;
    this.view = view;
    this.controller = controller;
}

SelectMode.prototype.mousemoveHandler = function(x, y) {
}

SelectMode.prototype.clickHandler = function(part, x, y, shiftKey) {
    //console.log("Controller", "selectMode");
    //console.log("Controller", "clickHandler", part, x, y, shiftKey);
    if (part) {
	if (part.selected) {
	    this.controller.moveAction();
	} else {
	    if (!shiftKey) {
		this.model.selectFirst(part.id);
	    } else {
		this.model.selectToggle(part.id);
	    }
	}
    } else {
	this.model.clearSelection();
    }
}

SelectMode.prototype.keydownHandler = function(key) {
    //console.log('Controller', 'keydownHandler', key);
    switch (key) {
    case 'a':
	this.model.selectConnected();
	break;
    case 'A':
	this.model.selectConnectedNeigh();
	break;
    case 'c':
	this.controller.moveAction();
	this.model.updateMovingCenter(this.view.mousex, this.view.mousey);
	break;
    case 'd':
	this.model.dupSelection();
	this.controller.insertAction();
	break;
    case 'g':
	this.model.toggleRuler(this.view.mousex, this.view.mousey);
	break;
    case 'k':
	this.model.delSelection();
	break;
    case 'm':
	this.controller.moveAction();
	break;
    case '+':
	this.model.setZoom(this.model.zoom + 1);
	break;
    case '-':
	this.model.setZoom(this.model.zoom - 1);
	break;
    case 'Escape':
	this.model.clearSelection();
	break;
    default:
	this.controller.keydownHandler(key);
	break;
    }
}


/* -- Verschieben -- */

function MoveAction(model, view, controller) {
    this.model = model;
    this.view = view;
    this.controller = controller;

    this.start = () => this.model.startMoving(this.view.mousex, this.view.mousey);
    this.cancel = () => this.model.cancelMoving();
    this.finish = () => this.model.stopMoving();
    this.mousemoveHandler = (x, y) => this.model.updateMovingPos(x, y);
    this.clickHandler = (part, x, y, shiftKey) => this.controller.finishAction();
    this.keydownHandler = (key) => {
	switch (key) {
	case 'c':
	    this.model.updateMovingCenter(this.view.mousex, this.view.mousey);
	    break;
	case 'k':
	    this.model.delSelection();
	    this.controller.finishAction();
	    break;
	case 'r':
	    this.model.updateMovingRotate(90);
	    break;
	case 'R': // Rotate selection to match the angle of the nearest connector
	    if (this.model.moving.nearestConnector) {
		const connectorA = this.model.moving.nearestConnector.connectorPos[2];
		const otherConnectorA = this.model.moving.nearestConnector.otherConnectorPos[2];
		//console.log('Controller', 'rotNearestAction', connectorA, otherConnectorA);
		this.model.updateMovingRotate(180 + otherConnectorA - connectorA);
	    }
	    break;
	case 's':
	    // Rotate selection to match the angle of the nearest connector
	    if (this.model.moving.nearestConnector) {
		let partId = this.model.moving.nearestConnector.partId;
		let connectorIndex = this.model.moving.nearestConnector.connectorIndex;
		let otherPartId = this.model.moving.nearestConnector.otherPartId;
		let otherConnectorIndex = this.model.moving.nearestConnector.otherConnectorIndex;
		const connectorA = this.model.moving.nearestConnector.connectorPos[2];
		const otherConnectorA = this.model.moving.nearestConnector.otherConnectorPos[2];
		//console.log('Controller', 'snapAction', connectorA, otherConnectorA);
		this.model.updateMovingRotate(180 + otherConnectorA - connectorA);
		const part = this.model.findPart(partId);
		const pos = part.getTransformedConnector(connectorIndex);
		const otherPart = this.model.findPart(otherPartId);
		const otherPos = otherPart.getTransformedConnector(otherConnectorIndex);
		const dx = otherPos[0] - pos[0];
		const dy = otherPos[1] - pos[1];
		//console.log('Controller', 'snapAction', dx, dy);
		this.model.updateMovingPos(this.model.moving.x + dx, this.model.moving.y + dy);
		this.controller.finishAction();
	    }
	    break;
	}
    }
}

/* -- Insert -- */

function InsertAction(model, view, controller) {
    this.model = model;
    this.view = view;
    this.controller = controller;
    this.moveAction = new MoveAction(model, view, controller);

    this.start = () => this.moveAction.start();
    this.finish = () => this.moveAction.finish();
    this.cancel = () => {
	this.model.delSelection();
	this.moveAction.cancel();
    }
    this.mousemoveHandler = this.moveAction.mousemoveHandler;
    this.clickHandler = this.moveAction.clickHandler;
    this.keydownHandler = this.moveAction.keydownHandler;
}

/* -- Controller -- */

function Controller(model, view) {
    this.model = model;
    this.view = view;

    view.setSizeHandler((w, h, z) => {
	this.model.setWidth(w);
	this.model.setHeight(h);
	this.model.setZoom(z);
    });

    view.setCatalogClickHandler((item) => {
	let part = this.model.addPart(item.id, this.view.mousex, this.view.mousey, 0);
	this.model.selectFirst(part.id);
	this.insertAction()
    });

    this.mode = new SelectMode(model, view, this);
    this.action = null;

    this.view.setMousemoveHandler((x, y) => {
	if (this.action) { this.action.mousemoveHandler(x, y); }
	else { this.mode.mousemoveHandler(x, y); }
    });

    view.setClickHandler((part, x, y, shiftKey) => {
	if (this.action) { this.action.clickHandler(part, x, y, shiftKey); }
	else { this.mode.clickHandler(part, x, y, shiftKey); }
    });

    this.view.setKeydownHandler((key) => {
	if (this.action) {
	    if (key == 'Escape') {
		this.cancelAction();
	    } else {
		this.action.keydownHandler(key);
	    }
	} else {
	    this.mode.keydownHandler(key);
	}
    });

    view.setButtonHandler((cmd) => {
	switch (cmd) {
	case 'help': this.helpDialogAction(); break;
	case 'load': this.model.load(); break;
	case 'save': this.model.save(); break;
	case 'storage': this.storageDialogAction(); break;
	}
    });

    view.update();
}

Controller.prototype.cancelAction = function() {
    if (this.action) {
	this.action.cancel();
	this.action = null;
    }
}

Controller.prototype.finishAction = function() {
    this.action.finish();
    this.action = null;
}

Controller.prototype.startAction = function(action) {
    this.cancelAction();
    this.action = action;
    action.start();
}

Controller.prototype.keydownHandler = function(key) {
    //console.log('controller', 'keydown', key);
    switch (key) {
    case 'B':
	this.bomDialogAction();
	break;
    case 'H':
	this.helpDialogAction();
	break;
    }
}

Controller.prototype.moveAction = function() {
    this.startAction(new MoveAction(this.model, this.view, this));
}

Controller.prototype.insertAction = function() {
    this.startAction(new InsertAction(this.model, this.view, this));
}

Controller.prototype.storageDialogAction = function() {
    if (this.action && this.action.constructor == StorageDialogAction) {
	this.cancelAction();
    } else {
	this.startAction(new StorageDialogAction(
	    this.model, this.view, this,
	    (event) => {
		switch (event.type) {
		case 'loadSlot':
		    this.model.loadLocalStorage(event.index);
		    break;
		case 'storeSlot':
		    this.model.setLocalStorageName(event.index, event.name);
		    this.model.storeLocalStorage(event.index);
		    break;
		case 'delSlot':
		    this.model.delLocalStorage(event.index);
		    break;
		}
	    }));
    }
}

Controller.prototype.bomDialogAction = function() {
    if (this.action && this.action.constructor == BomDialogAction) {
	this.cancelAction();
    } else {
	this.startAction(new BomDialogAction(this.model, this.view, this));
    }
}

Controller.prototype.helpDialogAction = function() {
    if (this.action && this.action.constructor == HelpDialogAction) {
	this.cancelAction();
    } else {
	this.startAction(new HelpDialogAction(this));
    }
}

