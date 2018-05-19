////// Clock made out of words
///// The words together create a sensible wording for the current time

//text position and size constants
const XSTART = 10,
	YSTART = 10,
	YSPACE = 70,
	XSPACE = 10,
	TEXTSIZE = 80;

//Possible textobjects that can be displayed
//already in correct location (prechecked nice and logical pixel positions)
const textobjs = {
	/// quantifiers
	five: new TextObject("FÜNF", 1),
	ten: new TextObject("ZEHN", 3),
	quarter: new TextObject("VIERTEL", 4),
	half: new TextObject("HALB", 2),
	//used when half stands not alone
	half2: new TextObject("HALB", 7),

	/// language prepositions
	to: new TextObject("VOR", 5),
	past: new TextObject("NACH", 8),
	oclock: new TextObject("UHR", 22),

	/// numbers for hour - (pseudo)random order
	//one when used with "o' clock"
	_1: new TextObject("EIN", 6),
	1: new TextObject("EINS", 13),
	2: new TextObject("ZWEI", 20),
	3: new TextObject("DREI", 10),
	4: new TextObject("VIER", 17),
	5: new TextObject("FÜNF", 9),
	6: new TextObject("SECHS", 21),
	7: new TextObject("SIEBEN", 16),
	8: new TextObject("ACHT", 18),
	9: new TextObject("NEUN", 19),
	10: new TextObject("ZEHN", 12),
	11: new TextObject("ELF", 15),
	12: new TextObject("ZWÖLF", 11),
	0: new TextObject("NULL", 14),
};

let texts = [];
//Time selection field and checkbox for time control
let timeSelect, timeControlActiveCB;
//whether time control is enabled
let timeControlActive = false,
	showCoords = false;

window.addEventListener("DOMContentLoaded", () => {
	timeControlActiveCB = document.getElementById("time-control-active");
	timeSelect = document.getElementById("time-select");
});

function setup() {
	createCanvas(window.innerWidth, window.innerHeight - 10);
	//web safe, clear and nice font.
	//also ensures text position & spacing correctness
	textFont("Arial");

	//initialize text object array with all elements in constant objects
	//this allows the use of array functions, iterators etc. on the text objects
	for (let text in textobjs) {
		texts.push(textobjs[text]);
	}

	//set text positions
	adjustTexts();
}

function draw() {
	/// logic

	//get current time (or control time by user)
	let hours = hour(),
		minutes = minute();
	timeControlActive = timeControlActiveCB.checked;
	//if there is time control and the time value can be splitted
	if (timeControlActive && timeSelect.value.split(":").length > 1) {
		hours = Number(timeSelect.value.split(":")[0]);
		minutes = Number(timeSelect.value.split(":")[1]);
	}

	//set text object "visibility"
	texts.forEach(t => t.active = false);
	//all correct text objects should be visible
	configureTime(minutes, hours).forEach(t => t.active = true);

	/// drawing

	background(0);
	texts.forEach(t => t.display());

	//uncomment this for debugging
	/*if (showCoords) {
		fill(255);
		textSize(20);
		text(`x = ${mouseX} | y = ${mouseY}`, mouseX, mouseY + 10);
	}*/
}

function keyPressed() {
	if (key === " ") {
		showCoords = !showCoords;
	}
}

//calculates the text positions according to font properties
function adjustTexts() {
	//ensures correct spacing
	textSize(TEXTSIZE);

	//sort texts by x value
	//initial x value will determine the text order
	texts.sort((a, b) => a.x - b.x);

	//current x and y
	let x = XSTART,
		y = YSTART;
	console.log(x, y);

	//naming has to be different from p5 global text function because somehow this variable becomes global
	for (localText of texts) {
		//distance to next text including spacing
		let thisTextWidth = textWidth(localText.t) + XSPACE;
		//text doesn't fit anymore...
		if (x + thisTextWidth > width) {
			//...move to new line
			x = XSTART;
			y += YSPACE;
		}

		//set x and y accordingly
		localText.x = x;
		localText.y = y;

		//set next x
		x += thisTextWidth;
	}
}

//returns all text objects that should be lit according to the minutes and hours
function configureTime(minute, hour) {
	//constrain hour between 1 and 12
	hour = (hour == 12) ? 12 : (hour % 12);
	//check hour validity
	if (hour < 0 || hour > 12) {
		console.warn("configureTime was called with invalid hour value.");
		return [textobjs[0]];
	}
	//check minute validity
	if (minute < 0 || minute >= 60) {
		//invalid minute
		console.warn("configureTime was called with invalid minute value.");
		return [textobjs[0]];
	}

	//already treats the "1" special case and the past-half case
	let hourText = ( //first part checks if minute is too high and increases hour if needed
			(hour = (minute > 17) ? (++hour == 12 ? 12 : hour % 12) : hour) == 1 && minute == 0) ?
		textobjs._1 : textobjs[hour];

	/// logic to create the right text combination
	if (minute <= 2) {
		//0-2 = 0
		return [hourText, textobjs.oclock];
	} else if (minute <= 7) {
		//3-7 = 5
		return [textobjs.five, textobjs.past, hourText];
	} else if (minute <= 12) {
		//8-12 = 10
		return [textobjs.ten, textobjs.past, hourText];
	} else if (minute <= 17) {
		//13-17 = 15
		return [textobjs.quarter, textobjs.past, hourText];
	} else if (minute <= 22) {
		//18-22 = 20
		return [textobjs.ten, textobjs.to, textobjs.half2, hourText];
	} else if (minute <= 27) {
		//23-27 = 25
		return [textobjs.five, textobjs.to, textobjs.half2, hourText];
	} else if (minute <= 32) {
		//28-32 = 30
		return [textobjs.half, hourText];
	} else if (minute <= 37) {
		//33-37 = 35
		return [textobjs.five, textobjs.past, textobjs.half2, hourText];
	} else if (minute <= 42) {
		//38-42 = 40
		return [textobjs.ten, textobjs.past, textobjs.half2, hourText];
	} else if (minute <= 47) {
		//33-47 = 45
		return [textobjs.quarter, textobjs.to, hourText];
	} else if (minute <= 52) {
		//48-52 = 50
		return [textobjs.ten, textobjs.to, hourText];
	} else {
		//53-59 = 55
		return [textobjs.five, textobjs.to, hourText];
	}

	//just to prevent errors
	return [textobjs[0]];
}
