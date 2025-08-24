import appJson from './app.json';

export default () => ({
	...appJson.expo,
	extra: {
		...appJson.expo.extra,
		API_DNS: process.env.API_DNS || appJson.expo.extra.API_DNS,
		API_VERSION: process.env.API_VERSION || appJson.expo.extra.API_VERSION,
	},
});
