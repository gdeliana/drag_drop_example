import fs from "fs";
import { BrowserWindow, dialog, app } from "electron";

export async function saveJson(json:any) {
	const main_win = BrowserWindow.getFocusedWindow();

	let filename = await dialog.showSaveDialog(main_win, {
		title: "Select the place where you want to save the JSON",
		buttonLabel: "Save JSON",
		filters: [{ name: "JSON files", extensions: ["json"] }],
		defaultPath: app.getPath('downloads')
	});

	if (!filename.canceled && filename.filePath != "") {
		const r = fs.writeFileSync(filename.filePath, JSON.stringify(json), "binary");
		console.log(r);
	}
}