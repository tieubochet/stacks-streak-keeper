import { userSession, CONTRACT_ADDRESS, CONTRACT_NAME, MINT_FUNCTION } from '../constants';
// Import StacksMainnet (Class) thay vì hằng số cũ
import { StacksMainnet } from '@stacks/network'; 
import { 
  callReadOnlyFunction, // ĐÃ SỬA: Dùng callReadOnlyFunction thay vì fetchCallReadOnlyFunction
  standardPrincipalCV, 
  ClarityType
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { UserStats } from '../types';

// Khởi tạo network bằng 'new'
const getNetwork = () => new StacksMainnet(); 

/**
 * Fetches the user stats from the smart contract
 */
export const fetchUserStats = async (address: string): Promise<UserStats | null> => {
  const network = getNetwork();

  try {
    // ĐÃ SỬA: Gọi callReadOnlyFunction
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user',
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
      network,
    });

    // Manual parsing logic
    // Result trả về là ClarityValue
    
    // Check for 'none'
    if (result.type === ClarityType.OptionalNone) {
      return null;
    }

    // Check for 'some' and ensure it wraps a Tuple
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
    console.error("Error fetching user stats:", error);
    return null;
  }
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