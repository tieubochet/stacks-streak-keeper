import { userSession, CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants';
import { StacksTestnet } from '@stacks/network';
import { 
  callReadOnlyFunction, 
  standardPrincipalCV, 
  ClarityType
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { UserStats } from '../types';

const getNetwork = () => new StacksTestnet(); // Default to Testnet

/**
 * Fetches the user stats from the smart contract
 */
export const fetchUserStats = async (address: string): Promise<UserStats | null> => {
  const network = getNetwork();

  try {
    const result = await callReadOnlyFunction({
      contractAddress: SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8,
      contractName: SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8.daily-checkin-v2,
      functionName: 'get-user',
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
      network,
    });

    // Manual parsing to avoid cvToValue compatibility issues
    // Result is (optional (tuple ...))
    
    // Check for 'none'
    if (result.type === ClarityType.OptionalNone) {
      return null;
    }

    // Check for 'some' and ensure it wraps a Tuple
    if (result.type === ClarityType.OptionalSome && result.value.type === ClarityType.Tuple) {
      const tupleData = result.value.data;

      // Helper to safely extract number from UIntCV
      // Note: value is BigInt, we convert to Number for UI
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
    functionArgs: [], // No arguments needed for check-in
    onFinish,
    onCancel,
    appDetails: {
      name: 'StreakProtocol',
      icon: window.location.origin + '/favicon.ico', // Placeholder
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
      return userSession.loadUserData().profile.stxAddress.testnet;
    } catch (e) {
      return null;
    }
  }
  return null;
};