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

/** @type {PWindow[]} */
let windows;

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
			default:
				alert("Invalid command: " + ln[0]);
		}
	}
	return false;
}

function mouseClicked() {
	let fwin = windows[focusedInx];
	for (let i in windows) {
		let win = windows[i];

		// close btn press detection
		let close = win.getCloseXYWH();
		if (mouseX >= close.x && mouseX <= close.x + close.w &&
			mouseY >= close.y && mouseY <= close.y + close.h)
		{
			closeWin(i);
			focusedInx = i;
			console.log("window with inx " + i + " (" + win.title + ") closed");
			return false;
		}
		for (let elem of win.elems) elem.isClicking(win);

		if (win.omitFFS) continue;

		// check if we are good to refocus
		if (fwin && fwin !== win)
		{
			if (mouseX >= fwin.x && mouseX <= fwin.x + fwin.getW() &&
				mouseY >= fwin.y && mouseY <= fwin.y + fwin.getH())
			{
				collidesWithFwin = true;
				return false;
			}
		}

		// then we refocus if needed
		if (mouseX >= win.x && mouseX <= win.x + win.getW() &&
			mouseY >= win.y && mouseY <= win.y + win.getH())
			if (focusedInx !== i)
				focusedInx = i;
		
	}
	return false;
}

function closeWin(i = -1)
{
	if (i >= windows.length && i < 0)
		return false;

	windows[i].onClose();
	windows.splice(i, 1);
	return true;
}
