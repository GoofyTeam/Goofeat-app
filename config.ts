import Constants from 'expo-constants';

type Extra = {
  API_DNS: string;
  API_VERSION: string;
  API_VERSION_V1?: string;
  API_VERSION_V2?: string;
};

const extra = Constants.expoConfig?.extra as Extra;

const API_DNS = extra?.API_DNS || 'https://tedjy.ddns.net';
const API_VERSION_V1 = extra?.API_VERSION_V1 || extra?.API_VERSION || '/api/v1';
const API_VERSION_V2 = extra?.API_VERSION_V2 || '/api/v2';

export const API_URL_V1 = `${API_DNS}${API_VERSION_V1}`;
export const API_URL_V2 = `${API_DNS}${API_VERSION_V2}`;
