import { ipcRenderer } from "electron";

const saveJsonRenderer = async (json:any) => {
	try {
		const r = await ipcRenderer.invoke("saveJson", json);
		return r;
	} catch (e) {
		throw e;
	}
};

export default saveJsonRenderer;