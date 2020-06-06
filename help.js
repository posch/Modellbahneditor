function HelpDialogAction(controller) {
    this.controller = controller;

    this.dialogElement = document.querySelector('#HelpDialog');
    this.dialogElement.querySelector('.dialogCloseButton').addEventListener(
	'click', (event) => this.controller.finishAction());

    this.show = () => { this.dialogElement.style.display = 'block'; }
    this.hide = () => { this.dialogElement.style.display = 'none'; }

    this.start = () => this.show();
    this.finish = () => this.hide();
    this.cancel = () => this.hide();
    this.mousemoveHandler = (x, y) => {}
    this.clickHandler = (part, x, y, shiftKey) => {}
    this.keydownHandler = (key) => {
	switch (key) {
	case 'Escape':
	case 'Enter':
	    this.controller.finishAction();
	    break;
	default:
	    this.controller.keydownHandler(key);
	    break;
	}
    }
}

