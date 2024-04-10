class PWinFile
{
	/**
	 * @param {string} info 
	 * @param {string} func 
	 * @param {string} extra 
	 */
	constructor(info, func, extra)
	{
		this.info = JSON.parse(info);
		this.func = new Function(func);
		this.extra = JSON.parse(extra);

		console.log(info, func, extra);
	}

	/**
	 * @param {string[]} fileContent 
	 */
	static parse(fileContent)
	{
		let info = "";
		let func = "";
		let extra = "";
		let status = 0; // 0-none, 1-info, 2-func, 3-extra
		for (let line of fileContent)
		{
			//console.log("Now parsing '" + line + "'");
			switch (status)
			{
				case 0:
					let ln = line.trim().split(' ');
					if (ln.length == 0) continue;
		
					switch (ln[0])
					{
						case "INFO":
							status = 1;
							break;
						case "SCRIPT":
							status = 2;
							break;
						case "EXTRADATA":
							status = 3;
							break;
					}
					break;
				case 1:
					if (line.trim() == "END")
					{
						status = 0;
						break;
					}
					info += line + "\n";
					break;
				case 2:
					if (line.trim() == "END")
					{
						status = 0;
						break;
					}
					func += line + "\n";
					break;
				case 3:
					if (line.trim() == "END")
					{
						status = 0;
						break;
					}
					extra += line + "\n";
					break;
			}
		}

		console.log(info, func, extra);
		return new PWinFile(info, func, extra);
	}
	asWin()
	{
		let win = new PWindow(this.info["title"], this.info["xPosition"], this.info["yPosition"], this.info["width"], this.info["height"], []);

		console.log(this.func);
		let h = {};
		this.func.call(h);
		return {window: win, thisObj: h, extraData: this.extra};
	}
}
