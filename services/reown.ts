import { UniversalConnector } from '@reown/appkit-universal-connector';


const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
console.log("Reown Project ID:", projectId);

if (!projectId) {
  throw new Error('VITE_REOWN_PROJECT_ID is not set');
}

const stacksMainnet = {
  id: 'stacks:1',
  chainNamespace: 'stacks',
  caipNetworkId: 'stacks:1',
  name: 'Stacks',
  nativeCurrency: { name: 'Stacks', symbol: 'STX', decimals: 6 },
  rpcUrls: { default: { http: ['https://stacks-node-api.mainnet.stacks.co'] } },
};

export const appKitConnector = new UniversalConnector({
  projectId,
  metadata: {
    name: 'Streak Keeper',
    description: 'Daily habit tracker on Stacks',
    url: 'https://stacks-streak-keeper.vercel.app',
    icons: ['https://raw.githubusercontent.com/tieubochet/stacks-streak-keeper/refs/heads/main/public/img/logo.png'],
  },
  networks: [{
      namespace: 'stacks',
      chains: [stacksMainnet],
      methods: ['stacks_signMessage', 'stacks_contractCall', 'stacks_stxTransfer'],
      events: [],
  }],
});

export const connectReown = async () => {
  try {
    const session = await appKitConnector.connect();
    return session;
  } catch (e) {
    console.error("Reown connection error:", e);
    return null;
  }
};