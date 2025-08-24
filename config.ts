import Constants from 'expo-constants';

type Extra = {
	API_DNS: string;
	API_VERSION: string;
};

const extra = Constants.expoConfig?.extra as Extra;

const { API_VERSION, API_DNS } = extra;
export const API_URL = `${API_DNS}${API_VERSION}`;
