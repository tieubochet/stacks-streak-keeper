import { userSession, CONTRACT_ADDRESS, CONTRACT_NAME, MINT_FUNCTION } from '../constants';
// Chú ý: Nếu bạn đang test, hãy dùng StacksTestnet thay vì StacksMainnet
import { StacksMainnet, StacksTestnet } from '@stacks/network'; 
import { 
  callReadOnlyFunction, 
  standardPrincipalCV, 
  ClarityType,
  PostConditionMode // Đã thêm import này
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { UserStats, LeaderboardEntry } from '../types';

// LƯU Ý QUAN TRỌNG: 
// Hãy đổi thành "new StacksTestnet()" nếu bạn đang chạy thử nghiệm và không muốn mất tiền thật.
const getNetwork = () => new StacksMainnet(); 

/**
 * Fetches the user stats from the smart contract
 */
export const fetchUserStats = async (address: string): Promise<UserStats | null> => {
  const network = getNetwork();

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user',
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
      network,
    });

    if (result.type === ClarityType.OptionalNone) {
      return { currentStreak: 0, maxStreak: 0, totalCheckins: 0 };
    }

    if (result.type === ClarityType.OptionalSome && result.value.type === ClarityType.Tuple) {
      const tupleData = (result.value as any).data;

      const getNum = (cv: any) => {
        if (cv && cv.type === ClarityType.UInt) {
          return Number(cv.value);
        }
        return 0;
      };

      return {
        currentStreak: getNum(tupleData['current-streak']),
        maxStreak: getNum(tupleData['max-streak']),
        totalCheckins: getNum(tupleData['total-checkins']),
      };
    }

    return null;

  } catch (error) {
    console.error(`Error fetching user stats for ${address}:`, error);
    return null;
  }
};

/**
 * Check SIP-009 Balance (To see if user owns the NFT)
 */
export const fetchNftBalance = async (address: string): Promise<number> => {
  const network = getNetwork();
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-balance', 
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
      network,
    });
    
    if (result.type === ClarityType.ResponseOk && result.value.type === ClarityType.UInt) {
      return Number(result.value.value);
    }
    return 0;
  } catch (e) {
    console.warn("Contract might not support standard SIP-009 get-balance or error occurred.");
    return 0;
  }
};

/**
 * Fetch stats for multiple users to build an On-Chain Leaderboard
 */
export const fetchLeaderboardData = async (
  candidateAddresses: string[], 
  currentUserAddress: string | null
): Promise<LeaderboardEntry[]> => {
  
  const allAddresses = new Set(candidateAddresses);
  if (currentUserAddress) allAddresses.add(currentUserAddress);
  
  const entries: LeaderboardEntry[] = [];
  
  const promises = Array.from(allAddresses).map(async (addr) => {
    const stats = await fetchUserStats(addr);
    if (stats) {
      return {
        address: addr,
        streak: stats.currentStreak,
        total: stats.totalCheckins,
        isCurrentUser: addr === currentUserAddress,
        rank: 0
      };
    }
    return null;
  });

  const results = await Promise.all(promises);
  const validResults = results.filter((r): r is LeaderboardEntry => r !== null);
  
  validResults.sort((a, b) => {
    if (b.streak !== a.streak) return b.streak - a.streak;
    return b.total - a.total;
  });

  return validResults.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
};

/**
 * Initiates the Check-In transaction
 */
export const performCheckIn = async (onFinish: (data: any) => void, onCancel: () => void) => {
  const network = getNetwork();
  
  await openContractCall({
    network,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'check-in',
    functionArgs: [], 
    // Check-in thường không chuyển tài sản nên không bắt buộc PostConditionMode.Allow, 
    // nhưng thêm vào cũng không sao nếu contract có logic phức tạp.
    onFinish,
    onCancel,
    appDetails: {
      name: 'StreakProtocol',
      icon: window.location.origin + '/favicon.ico', 
    },
  });
};

/**
 * Initiates the Mint NFT transaction
 */
export const performMintNft = async (onFinish: (data: any) => void, onCancel: () => void) => {
  const network = getNetwork();
  
  await openContractCall({
    network,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: MINT_FUNCTION,
    functionArgs: [], 
    postConditionMode: PostConditionMode.Allow, // <-- Đã sửa: Cho phép nhận NFT
    onFinish,
    onCancel,
    appDetails: {
      name: 'StreakProtocol',
      icon: window.location.origin + '/favicon.ico',
    },
  });
};

/**
 * Authenticate User
 */
export const authenticate = () => {
  userSession.handlePendingSignIn().then(() => {
    window.location.reload();
  }).catch(() => {
     // do nothing
  });
};

export const getUserAddress = (): string | null => {
  if (userSession.isUserSignedIn()) {
    try {
      return userSession.loadUserData().profile.stxAddress.mainnet;
    } catch (e) {
      return null;
    }
  }
  return null;
};