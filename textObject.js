class TextObject {
	constructor(text, c1, c2) {
		this.t = text;
		this.x = c1 ? (c1.x | c1) : 0;
		this.y = c1 ? (c1.y | c2) : 0;
		this.active = false;
	}

	setActive(activeness) {
		this.active = activeness;
	}

	switchActive() {
		this.active = !this.active;
	}

	display() {
		push();
		textAlign(LEFT, TOP);
		textSize(64);
		fill(this.active ? 255 : 10);
		stroke(this.active ? 255 : 10);
		text(this.t, this.x, this.y);
		pop();
	}
}


//<>|
