// pisskrnl.js
// kernel of the p5.js Interactive System Simulator (piss)
// by Matto58
// licensed under CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/

const WINBAR_HEIGHT = 36, WINBAR_WIDTH = 2;

class PWindow
{
	/**
	 * Creates a window.
	 * @param {String} title Window title.
	 * @param {Number} x The X position of the window.
	 * @param {Number} y The Y position of the window.
	 * @param {Number} w The window width.
	 * @param {Number} h The window height.
	 * @param {PWinElement[]} elements The elements of the window.
	 * @param {boolean} showWindowFrame Show the frame of the window.
	 * @param {boolean} omitFromFocusSelection Prevent window from being selected when clicked on.
	 * @param {string} windowFrameFocusedColor Color of the window frame when focused.
	 * @param {string} windowTitleFocusedColor Color of the title in the window frame when focused.
	 */
	constructor(title, x, y, w, h, elements, showWindowFrame = true, omitFromFocusSelection = false,
		windowFrameFocusedColor = "#00cfff", windowTitleFocusedColor = "black",
		windowFrameUnfocusedColor = "#cfcfcf", windowTitleUnfocusedColor = "#222222")
	{
		this.title = title;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.elems = elements;
		this.frame = showWindowFrame;
		this.omitFFS = omitFromFocusSelection;
		this.frameClr = windowFrameFocusedColor;
		this.titleClr = windowTitleFocusedColor;
		this.frameClrUnfocus = windowFrameUnfocusedColor;
		this.titleClrUnfocus = windowTitleUnfocusedColor;
	}

	getW() { return (this.frame ? WINBAR_WIDTH*2 : 0) + this.w; }
	getH() { return (this.frame ? WINBAR_HEIGHT + WINBAR_WIDTH : 0) + this.h; }
	getCloseXYWH()
	{
		//if (frameCount == 1)
		//	console.log(this);
		return {
			x: this.x + this.w - WINBAR_HEIGHT + WINBAR_WIDTH*2,
			y: this.y,
			w: WINBAR_HEIGHT,
			h: WINBAR_HEIGHT
		};
	}

	onClose()
	{
		for (let elem of this.elems)
		{
			if (elem.type == "embed") elem.props.iframe.remove();
		}
	}

	clone()
	{
		return new PWindow(
			this.title,
			this.x, this.y,
			this.w, this.h,
			this.elems.map(elem => elem.clone()),
			this.frame,
			this.omitFFS,
			this.frameClr,
			this.titleClr,
			this.frameClrUnfocus,
			this.titleClrUnfocus
		);
	}

	/**
	 * @param {boolean} isFocused 
	 */
	draw(isFocused)
	{
		if (this.frame)
		{
			noStroke();

			fill(isFocused ? this.frameClr : this.frameClrUnfocus);
			rect(this.x, this.y, this.getW(), this.getH());

			fill(isFocused ? this.titleClr : this.titleClrUnfocus);
			textFont("Arial");
			textSize(16);
			textAlign(CENTER, CENTER);
			text(this.title, this.x + this.w/2, this.y + WINBAR_HEIGHT/2);

			fill(0);
			rect(
				WINBAR_WIDTH + this.x,
				WINBAR_HEIGHT + this.y,
				this.w, this.h
			);

			fill(255, 0, 0);
			let close = this.getCloseXYWH();
			rect(close.x, close.y, close.w, close.h);

			this.x += WINBAR_WIDTH;
			this.y += WINBAR_HEIGHT;
		}

		/*
		noStroke();
		fill(127);
		rect(this.x, this.y, this.w, this.h);
		*/

		for (let element of this.elems)
			element.draw(this);

		if (this.frame)
		{
			this.x -= WINBAR_WIDTH;
			this.y -= WINBAR_HEIGHT;
		}
	}
}

class PWinElement
{
	/**
	 * @param {String} type
	 * @param {*} props
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w
	 * @param {Number} h
	 */
	constructor(type, props, x, y, w, h)
	{
		this.type = type;
		this.props = props;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		
		this.prevX = 0;
		this.prevY = 0;
		this.prevW = 0;
		this.prevH = 0;

		if (type == "embed")
		{
			this.props.iframe = createElement("iframe");
			this.props.iframe.attribute("src", props.uri ?? "about:blank");
			this.props.iframe.size(w, h);
			this.props.iframe.position(x, y);
		}
	}

	clone()
	{
		return new PWinElement(
			this.type,
			this.props,
			this.x, this.y,
			this.w, this.h
		);
	}

	/**
	 * @param {PWindow} parent 
	 */
	isClicking(parent)
	{
		if (mouseX >= parent.x + this.x && mouseX <= parent.x + this.x + this.w
			&& mouseY >= parent.y + this.y && mouseY <= parent.y + this.y + this.h
			&& this.props.onclick)
			this.props.onclick(this, parent);
	}

	/**
	 * @param {String} imgUri 
	 */
	applyImg(imgUri)
	{
		this.props.img = loadImage(imgUri);
		return this;
	}

	/**
	 * @param {PWindow} parent 
	 */
	draw(parent)
	{
		switch (this.type)
		{
			case "rect":
				noStroke();
				fill(this.props.r, this.props.g, this.props.b, this.props.a ?? 255);
				rect(parent.x + this.x, parent.y + this.y, this.w, this.h);
				break;
			case "text":
				noStroke();
				fill(this.props.r, this.props.g, this.props.b, this.props.a ?? 255);
				textFont(this.props.font ?? "Arial");
				textSize(this.props.size ?? 12);
				textAlign(this.props.textAlignHoriz ?? LEFT, this.props.textAlignVert ?? TOP);
				text(this.props.text, parent.x + this.x, parent.y + this.y);
				break;
			case "img":
			case "button":
				image(this.props.img, parent.x + this.x, parent.y + this.y, this.w, this.h);
				break;
			case "embed":
				/*if (frameCount < 3)
				{
					console.log(this);
					console.log(parent);
					console.log(parent.x + this.x);
				}*/
				if (this.prevX != parent.x + this.x || this.prevY != parent.y + this.y)
					this.props.iframe.position(parent.x + this.x, parent.y + this.y);

				if (this.prevW != this.w || this.prevH != this.h)
					this.props.iframe.size(this.w, this.h);
				break;
			default:
				console.error("Invalid PWinElement type: " + this.type);
				break;
		}
		this.prevX = parent.x + this.x;
		this.prevY = parent.y + this.y;
		this.prevW = this.w;
		this.prevH = this.h;
	}
}
