const { json } = require('body-parser');
const fs = require('fs');

module.exports = (app) => {
	app.get(`${global.request_uri}get-json`, (req, res) => {
		const json_file = fs.readFileSync('./task.recording.json');
		res.json(JSON.parse(json_file));
		res.end();
	});
};
