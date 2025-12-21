
import { AppConfig, UserSession } from '@stacks/connect';

// Stacks App Configuration
export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Contract Configuration
export const CONTRACT_ADDRESS = 'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8'; 
export const STREAK_CONTRACT = 'teeboo-streak';
export const DIARY_CONTRACT = 'diary-v1';
export const NETWORK = 'mainnet'; 

// UI Constants
export const APP_NAME = "StreakProtocol";
export const EXPLORER_BASE_URL = "https://explorer.hiro.so";

export const LEADERBOARD_CANDIDATES = [
  'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
  'SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS',
  'SP2J6EF482VRV4K497Z538TNC2EAJPJ4F81963F01',
  'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335',
  'SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8',
];
