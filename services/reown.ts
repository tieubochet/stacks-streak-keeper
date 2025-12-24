import { UniversalConnector } from '@reown/appkit-universal-connector';

let connectorInstance: UniversalConnector | null = null;

// Chỉ khởi tạo khi cần dùng
export const getConnector = () => {
  if (!connectorInstance) {
    const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
    if (!projectId) {
        console.warn('WalletConnect disabled: missing projectId')
        return
    }
    // Cấu hình Stacks
    const stacksMainnet = {
      id: 'stacks:1',
      chainNamespace: 'stacks',
      caipNetworkId: 'stacks:1',
      name: 'Stacks',
      nativeCurrency: { name: 'Stacks', symbol: 'STX', decimals: 6 },
      rpcUrls: { default: { http: ['https://stacks-node-api.mainnet.stacks.co'] } },
    };

    connectorInstance = new UniversalConnector({
      projectId,
      metadata: {
        name: 'Streak Keeper',
        description: 'Daily habit tracker on Stacks',
        url: typeof window !== 'undefined' ? window.location.origin : '', // Tránh lỗi khi build
        icons: ['https://raw.githubusercontent.com/tieubochet/stacks-streak-keeper/refs/heads/main/public/img/logo.png'],
      },
      networks: [{
          namespace: 'stacks',
          chains: [stacksMainnet],
          methods: ['stacks_signMessage', 'stacks_contractCall', 'stacks_stxTransfer'],
          events: [],
      }],
    });
  }
  return connectorInstance;
};

// Hàm connect gọi qua instance
export const connectReown = async () => {
  try {
    const connector = getConnector();
    const session = await connector.connect();
    return session;
  } catch (e) {
    console.error("Reown connection error:", e);
    return null;
  }
};