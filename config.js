const internalIp = require("internal-ip");
const fs = require("fs");

const ip = internalIp.v4.sync();
let production;
try {
	production = require("./config.prod.js");
} catch (error) {
	console.error("Error loading config:", error);
}

const env = {
	development: {
		devServer: {
			server: {
				type: "http",
			},
			// open: true,
			port: 9060,
		},
		env: {
			// Docker requires laptop IP address
			SERVER_DOMAIN: `http://${ip}:5400/api`,
		},
	},
	production,
};

function getEnv(isDevelopment) {
	return isDevelopment ? env.development : env.production;
}

module.exports = getEnv;
