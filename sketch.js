////// Clock made out of words
///// The words together create a sensible wording for the current time



//Possible textobjects that can be displayed
//already in correct location (prechecked nice and logical pixel positions)
const textobjs = {
	/// quantifiers
	ten: new TextObject("ZEHN", 180, 10),
	quarter: new TextObject("VIERTEL", 360, 10),
	half: new TextObject("HALB", 10, 10),
	//used when half stands not alone
	half2: new TextObject("HALB", 450, 70),

	/// language prepositions
	to: new TextObject("VOR", 13, 70),
	past: new TextObject("NACH", 156, 70),
	oclock: new TextObject("UHR", 10, 370),

	/// numbers for hour - (pseudo)random order
	//one when used with "o' clock"
	_1: new TextObject("EIN", 340, 70),
	1: new TextObject("EINS", 185, 190),
	2: new TextObject("ZWEI", 195, 310),
	3: new TextObject("DREI", 185, 130),
	4: new TextObject("VIER", 250, 250),
	5: new TextObject("FÜNF", 10, 130),
	6: new TextObject("SECHS", 360, 310),
	7: new TextObject("SIEBEN", 10, 250),
	8: new TextObject("ACHT", 410, 250),
	9: new TextObject("NEUN", 10, 310),
	10: new TextObject("ZEHN", 10, 190),
	11: new TextObject("ELF", 510, 190),
	12: new TextObject("ZWÖLF", 345, 130),
	0: new TextObject("NULL", 340, 190),
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
	createCanvas(630, 600);
	//web safe, clear and nice font. Text positions are aligned to this specific font's character widths at 64 pt.
	textFont("Arial");

	for (let text in textobjs) {
		texts.push(textobjs[text]);
	}
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
		text(`x = ${mouseX} | y = ${mouseY}`, mouseX + 10, mouseY + 10);
	}*/
}

function keyPressed() {
	if (key === " ") {
		showCoords = !showCoords;
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

	//already treats the "1" special case and the past-half case
	let hourText = ( //first part checks if minute is too high and increases hour if needed
			(hour = (minute > 17) ? (++hour == 12 ? 12 : hour % 12) : hour) == 1 && minute == 0) ?
		textobjs._1 : textobjs[hour];


	if (minute < 0 || minute >= 60) {
		//invalid minute
		console.warn("configureTime was called with invalid minute value.");
		return [textobjs[0]];
	}

	/// logic to create the right text combination
	if (minute >= 0 && minute <= 4) {
		//0-4 = 0
		return [hourText, textobjs.oclock];
	} else if (minute <= 12) {
		//5-12 = 10
		return [textobjs.ten, textobjs.past, hourText];
	} else if (minute <= 17) {
		//13-17 = 15
		return [textobjs.quarter, textobjs.past, hourText];
	} else if (minute <= 24) {
		//17-24 = 20
		return [textobjs.ten, textobjs.to, textobjs.half2, hourText];
	} else if (minute <= 34) {
		//25-34 = 30
		return [textobjs.half, hourText];
	} else if (minute <= 42) {
		//35-42 = 40
		return [textobjs.ten, textobjs.past, textobjs.half2, hourText];
	} else if (minute <= 47) {
		//43-47 = 45
		return [textobjs.quarter, textobjs.to, hourText];
	} else {
		//48-59 = 50
		return [textobjs.ten, textobjs.to, hourText];
	}

	//just to prevent errors
	return [textobjs[0]];
}
