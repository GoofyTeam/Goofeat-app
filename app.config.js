import appJson from './app.json';

export default () => ({
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    API_DNS: process.env.API_DNS || appJson.expo.extra.API_DNS,
    API_VERSION_V1:
      process.env.API_VERSION_V1 || appJson.expo.extra.API_VERSION_V1,
    API_VERSION_V2:
      process.env.API_VERSION_V2 || appJson.expo.extra.API_VERSION_V2,
  },
});
