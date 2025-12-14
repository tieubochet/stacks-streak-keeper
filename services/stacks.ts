import { userSession, CONTRACT_ADDRESS, CONTRACT_NAME, MINT_FUNCTION } from '../constants';
// SỬA ĐỔI 1: Import StacksMainnet (class) thay vì hằng số
import { StacksMainnet } from '@stacks/network';
import { 
  fetchCallReadOnlyFunction, 
  standardPrincipalCV, 
  ClarityType
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { UserStats, LeaderboardEntry } from '../types';

// SỬA ĐỔI 2: Khởi tạo network bằng 'new'
const getNetwork = () => new StacksMainnet(); 

/**
 * Fetches the user stats from the smart contract
 */
export const fetchUserStats = async (address: string): Promise<UserStats | null> => {
  const network = getNetwork();

  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user',
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
      network,
    });

    // Result is (optional (tuple ...))
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
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-balance', // Standard SIP-009 function
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
      network,
    });
    
    // SIP-009 get-balance returns (response uint uint)
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
  
  // Ensure unique addresses
  const allAddresses = new Set(candidateAddresses);
  if (currentUserAddress) allAddresses.add(currentUserAddress);
  
  const entries: LeaderboardEntry[] = [];
  
  // Fetch in parallel
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
  
  // Filter nulls and sort
  const validResults = results.filter((r): r is LeaderboardEntry => r !== null);
  
  validResults.sort((a, b) => {
    if (b.streak !== a.streak) return b.streak - a.streak;
    return b.total - a.total;
  });

  // Assign ranks
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
    onFinish,
    onCancel,
    appDetails: {
      name: 'StreakProtocol',
      icon: window.location.origin + '/favicon.ico',
    },
    // Note: In a production app, we would add postConditions here to ensure 
    // the user receives the NFT asset they expect.
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