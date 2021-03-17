//@ts-ignore
import { ipcRenderer } from "electron";

const getJsonRenderer = async () => {
	try {
		const r = await ipcRenderer.invoke("getJson", null);
		return r;
	} catch (e) {
		throw e;
	}
};

export default getJsonRenderer;