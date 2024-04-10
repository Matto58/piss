// piss.js
// main file of the p5.js Interactive System Simulator (piss)
// by Matto58
// licensed under CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/

/** @type {PWindow} */
let desktop;

/** @type {PWindow} */
let example;

/** @type {PWindow} */
let embedTest;

/** @type {PWindow} */
let taskbar;

/** @type {{window: PWindow, thisObj: any, extraData: any}} */
let pwParseTest;

/** @type {PWindow[]} */
let windows;

/** @type {{window: PWindow, thisObj: any, extraData: any}[]} */
let windowsFromFile;

let focusedInx = 2;

const TASKBAR_SIZE = 48;

function setup()
{
	createCanvas(1920, 1080);
	frameRate(60);

	desktop = new PWindow("Desktop", 0, 0, width, height, [
		new PWinElement("img", {}, 0, 0, width, height),
	], false, true);
	desktop.elems[0].applyImg("img/bg.png");

	example = new PWindow("Example", 16, 16, 400, 400,
	[
		new PWinElement("rect",
		{
			r: 127, g: 0, b: 191
		}, 0, 0, 400, 400),
		new PWinElement("text",
		{
			r: 255, g: 255, b: 255,
			text: "google en passant",
			size: 40,
			textAlignHoriz: CENTER, textAlignVert: CENTER
		}, 200, 200, 0, 0)
	], true);

	embedTest = new PWindow("Embed test", 500, 16, 1280, 720,
	[
		new PWinElement("embed",
		{
			uri: "https://matto58.github.io"
		}, 0, 0, 1280, 720)
	], true);

	taskbar = new PWindow("Taskbar", 0, height - TASKBAR_SIZE, width, TASKBAR_SIZE,
	[
		new PWinElement("rect",
		{
			r: 255, g: 255, b: 255, a: 127
		}, 0, 0, width, TASKBAR_SIZE),
		new PWinElement("button", 
		{
			onclick: (element, parent) =>
			{
				console.log("Detected click on:");
				console.log(element);
				console.log(parent);
				alert("Clicked!");
			}
		}, TASKBAR_SIZE/8, TASKBAR_SIZE/8, TASKBAR_SIZE - TASKBAR_SIZE/4, TASKBAR_SIZE - TASKBAR_SIZE/4),
	], false, true);
	taskbar.elems[1].applyImg("https://matto58.github.io/the owo.ico");

	windows = [desktop, example, embedTest, taskbar];
	windowsFromFile = [];

	dlWinFF("winmods/example.pw").then(w => {
		if (!w) alert("Failed to load example.pw");
		else windowsFromFile.push(w);
	})
	.catch(e => {
		alert("pakala! " + e);
	});
	
	// todo: make clicking on embed elements focus the window
	//windows[2].elems[0].props.iframe.mouseClicked(mouseClicked);
}

function draw()
{
	let focusedWin;
	//background(frameCount % 256);
	for (let i in windows)
	{
		if (i == focusedInx)
			focusedWin = windows[i];
		else
			windows[i].draw(false);
	}
	for (let i in windowsFromFile)
	{
		let w = windowsFromFile[i];
		if (w.thisObj.onOpen && !w.thisObj._onOpenExecDone)
		{
			w.thisObj.onOpen(w.window, w.extraData);
			w.thisObj._onOpenExecDone = true;
		}
		if (i + windows.length == focusedInx)
			focusedWin = w.window;
		else
			w.window.draw(false);
	}
	if (focusedWin) focusedWin.draw(true);
}

function keyTyped()
{
	if (key.toString().toUpperCase() === "D")
	{
		let cmd = prompt("You have invoked the PISS debug prompt; please enter a command.");
		if (!cmd) return false;

		let ln = cmd.split(" ");
		switch (ln[0])
		{
			case "move":
				if (ln.length < 4)
				{
					alert("Too little args; got " + (ln.length-1) + ", expecting 3 (inx x y)");
					return false;
				}
				let inx = parseInt(ln[1]), x = parseInt(ln[2]), y = parseInt(ln[3]);
				if (inx >= windows.length || inx < 0)
				{
					alert("Index out of range; got " + inx + ", PWindow array size is " + windows.length);
					return false;
				}
				windows[inx].x = x;
				windows[inx].y = y;
				break;
			case "start":
				if (ln.length < 4)
				{
					alert("Too little args; got " + (ln.length-1) + ", expecting 3 (id x y)");
					return false;
				}
				let id = ln[1];
				let x2 = parseInt(ln[2]), y2 = parseInt(ln[3]);

				let window;
				switch (id.toLowerCase())
				{
					case "example":
						window = example.clone();
						break;
					case "embedtest":
						window = embedTest.clone();
						window.onClose();
						let uri = prompt("URI:");
						window.elems[0] = new PWinElement("embed", {uri: uri}, 0, 0, window.w, window.h);
						break;
					default:
						alert("Invalid window ID: " + id);
						return false;
				}
				window.x = x2;
				window.y = y2;
				windows.push(window);
				break;
			case "startpw":
				if (ln.length < 4)
				{
					alert("Too little args; got " + (ln.length-1) + ", expecting 3 (uri x y)");
					return false;
				}

				break;
			default:
				alert("Invalid command: " + ln[0]);
		}
	}
	return false;
}

/**
 * 
 * @param {PWindow} win 
 * @param {PWindow} fwin 
 * @returns 
 */
function checkCol(win, fwin, i)
{
	// close btn press detection
	let close = win.getCloseXYWH();
	if (mouseX >= close.x && mouseX <= close.x + close.w &&
		mouseY >= close.y && mouseY <= close.y + close.h)
	{
		if (!closeWin(i))
			if (!closeWinFF(i - windows.length))
				console.log(`Close failed (closeWin(${i})=false, closeWinFF(${i - windowsFromFile.length})=false)`)
		focusedInx = i-1;
		console.log("window with inx " + i + " (" + win.title + ") closed");
		return false;
	}
	for (let elem of win.elems) elem.isClicking(win);

	if (win.omitFFS) return true;

	// check if we are good to refocus
	if (fwin && fwin !== win)
	{
		if (mouseX >= fwin.x && mouseX <= fwin.x + fwin.getW() &&
			mouseY >= fwin.y && mouseY <= fwin.y + fwin.getH())
		{
			collidesWithFwin = true;
			console.log("refocus not ok!");
			return false;
		}
	}

	console.log("refocus ok!");

	// then we refocus if needed
	if (mouseX >= win.x && mouseX <= win.x + win.getW() &&
		mouseY >= win.y && mouseY <= win.y + win.getH() &&
		focusedInx !== i)
		{
			console.log(`refocus done! ${focusedInx} ${i}`);
			focusedInx = i;
		}
	else console.log(`refocus not done! ${focusedInx} ${i}`);

	return true;
}

function mouseClicked() {
	let fwin = windows[focusedInx];
	let i = 0;
	for (; i < windows.length; i++) {
		let win = windows[i];
		//console.log("windows: Checking for: ", win);
		if (!checkCol(win, fwin, i)) return false;
	}
	fwin = windowsFromFile[focusedInx-windows.length];
	for (let j = 0; j < windowsFromFile.length; j++)
	{
		let win = windowsFromFile[j];
		//console.log("windowsFromFile: Checking for: ", win.window);
		if (!checkCol(win.window, fwin, i)) return false;
		i++;
	}
	return false;
}

function closeWin(i = -1)
{
	if (!windows[i])
		return false;

	windows[i].onClose();
	windows.splice(i, 1);
	return true;
}
function closeWinFF(i = -1)
{
	if (!windowsFromFile[i])
		return false;

	windowsFromFile[i].window.onClose();
	windowsFromFile.splice(i, 1);
	return true;
}

/**
 * @param {string} uri 
 */
async function dlWinFF(uri)
{
	let win;
	let res = await fetch(uri);
	let data = await res.text();
		
	let pw = PWinFile.parse(data.split(/\r?\n/));
	console.log("dlWinFF: parsed:", pw);

	if (!pw)
	{
		console.log("dlWinFF: failed to exec static PWinFile.parse()");
		return null;
	}
	
	win = pw.asWin();
	console.log("dlWinFF: execed .asWin():", win);

	if (!win) console.log("dlWinFF: failed to exec PWinFile.asWin()");
	else return win;
}
