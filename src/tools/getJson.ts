import axios from 'axios';

export async function getJson() {
	let r = await axios.get('http://localhost:3001/get-json');
	return r.data;
}