import { AppConfig, UserSession } from '@stacks/connect';

// Stacks App Configuration
export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Contract Configuration
// NOTE: These should be updated to the actual deployed contract address on Testnet/Mainnet
export const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; 
export const CONTRACT_NAME = 'streak-counter';
export const NETWORK = 'testnet'; // 'testnet' or 'mainnet'

// UI Constants
export const APP_NAME = "StreakProtocol";
export const EXPLORER_BASE_URL = "https://explorer.hiro.so";

// Mock Data for Leaderboard (since the provided contract doesn't support get-all)
export const MOCK_LEADERBOARD_DATA = [
  { address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE', streak: 42, total: 156 },
  { address: 'SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS', streak: 38, total: 120 },
  { address: 'SP2J6EF482VRV4K497Z538TNC2EAJPJ4F81963F01', streak: 12, total: 45 },
  { address: 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335', streak: 5, total: 12 },
];