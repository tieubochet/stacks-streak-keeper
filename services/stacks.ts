import { userSession, CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants';

import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { 
  callReadOnlyFunction, 
  standardPrincipalCV, 
  ClarityType,
  PostConditionMode 
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { UserStats, LeaderboardEntry } from '../types';


const getNetwork = () => new StacksMainnet(); 


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
    console.warn("Lỗi khi check balance NFT:", e);
    return 0;
  }
};

export const fetchLeaderboardData = async (
  candidateAddresses: string[], 
  currentUserAddress: string | null
): Promise<LeaderboardEntry[]> => {
  
  const allAddresses = new Set(candidateAddresses);
  if (currentUserAddress) allAddresses.add(currentUserAddress);
  
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


export const performCheckIn = async (onFinish: (data: any) => void, onCancel: () => void) => {
  const network = getNetwork();
  
  await openContractCall({
    network,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'check-in',
    functionArgs: [], 

    postConditionMode: PostConditionMode.Allow, 
    onFinish,
    onCancel,
    appDetails: {
      name: 'StreakProtocol',
      icon: window.location.origin + '/favicon.ico', 
    },
  });
};


export const authenticate = () => {
  userSession.handlePendingSignIn().then(() => {
    window.location.reload();
  }).catch(() => {});
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