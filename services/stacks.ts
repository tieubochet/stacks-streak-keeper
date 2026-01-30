// services/stacks.ts
import { userSession, CONTRACT_ADDRESS, STREAK_CONTRACT, DIARY_CONTRACT } from '../constants';
import { StacksMainnet } from '@stacks/network';
import { 
  callReadOnlyFunction, 
  standardPrincipalCV, 
  ClarityType,
  PostConditionMode,
  stringUtf8CV,
  uintCV // Import thêm cho DAO
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { UserStats, LeaderboardEntry, GlobalStory } from '../types';

// Return the network instance.
const getNetwork = () => new StacksMainnet();

// === PHẦN CODE CŨ (ĐỪNG XÓA) ===

export const fetchUserStats = async (address: string): Promise<UserStats | null> => {
  const network = getNetwork();
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: STREAK_CONTRACT,
      functionName: 'get-user',
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
      network,
    });
    if (result.type === ClarityType.OptionalNone) return { currentStreak: 0, maxStreak: 0, totalCheckins: 0 };
    if (result.type === ClarityType.OptionalSome && result.value.type === ClarityType.Tuple) {
      const data = (result.value as any).data;
      return {
        currentStreak: Number(data['current-streak'].value),
        maxStreak: Number(data['max-streak'].value),
        totalCheckins: Number(data['total-checkins'].value),
      };
    }
    return null;
  } catch (e) { return null; }
};

// Lưu ý: Nếu contract diary-v1 chưa có hàm get-full-story, hàm này sẽ lỗi.
// Bạn cần đảm bảo contract đã update hoặc comment hàm này lại nếu chưa dùng.
export const fetchGlobalStory = async (): Promise<GlobalStory> => {
  const network = getNetwork();
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: DIARY_CONTRACT,
      functionName: 'get-full-story', // Hàm này phải tồn tại trong contract
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network,
    });

    if (result.type === ClarityType.ResponseOk && result.value.type === ClarityType.Tuple) {
      const data = (result.value as any).data;
      return {
        fullContent: data['content'].value, // Kiểm tra kỹ key trả về từ contract
        lastWord: data['last-word']?.value || "",
        contributors: [] 
      };
    }
  } catch (e) { console.error(e); }
  return { fullContent: "The story is yet to be written...", lastWord: "", contributors: [] };
};

export const fetchContributors = async (): Promise<string[]> => {
    const network = getNetwork();
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: DIARY_CONTRACT,
        functionName: 'get-contributors',
        functionArgs: [],
        senderAddress: CONTRACT_ADDRESS,
        network,
      });
      if (result.type === ClarityType.ResponseOk && result.value.type === ClarityType.List) {
        return result.value.list.map((cv: any) => cv.address);
      }
    } catch (e) { console.error(e); }
    return [];
};

export const performMintStory = async (content: string, word: string, onFinish: (data: any) => void) => {
  const network = getNetwork();
  await openContractCall({
    network,
    contractAddress: CONTRACT_ADDRESS,
    contractName: DIARY_CONTRACT,
    functionName: 'mint-story-part',
    functionArgs: [stringUtf8CV(content), stringUtf8CV(word)],
    postConditionMode: PostConditionMode.Allow,
    onFinish,
    appDetails: { name: 'StreakProtocol', icon: window.location.origin + '/favicon.ico' },
  });
};

export const performCheckIn = async (onFinish: (data: any) => void, onCancel: () => void) => {
  const network = getNetwork();
  await openContractCall({
    network,
    contractAddress: CONTRACT_ADDRESS,
    contractName: STREAK_CONTRACT,
    functionName: 'check-in',
    functionArgs: [], 
    postConditionMode: PostConditionMode.Allow, 
    onFinish,
    onCancel,
    appDetails: { name: 'StreakProtocol', icon: window.location.origin + '/favicon.ico' },
  });
};

export const fetchNftBalance = async (address: string) => 0; // Simplified
export const fetchLeaderboardData = async (c: string[], u: string | null) => []; // Simplified


export const getUserAddress = (): string | null => {
  if (userSession.isUserSignedIn()) {
    return userSession.loadUserData().profile.stxAddress.mainnet;
  }
  return null;
};



export const STORY_DAO_CONTRACT = 'story-dao'; // Tên contract mới

export const submitProposal = async (content: string, onFinish: (data: any) => void) => {
  const network = getNetwork();
  await openContractCall({
    network,
    contractAddress: CONTRACT_ADDRESS,
    contractName: STORY_DAO_CONTRACT,
    functionName: 'submit-proposal',
    functionArgs: [stringUtf8CV(content)],
    postConditionMode: PostConditionMode.Allow,
    onFinish,
    appDetails: { name: 'StreakProtocol', icon: window.location.origin + '/favicon.ico' },
  });
};

export const voteForProposal = async (proposalId: number, onFinish: (data: any) => void) => {
  const network = getNetwork();
  await openContractCall({
    network,
    contractAddress: CONTRACT_ADDRESS,
    contractName: STORY_DAO_CONTRACT,
    functionName: 'vote-proposal',
    functionArgs: [uintCV(proposalId)],
    postConditionMode: PostConditionMode.Allow,
    onFinish,
    appDetails: { name: 'StreakProtocol', icon: window.location.origin + '/favicon.ico' },
  });
};

export const fetchProposals = async (roundId: number): Promise<any[]> => {
    const network = getNetwork();

    try {
        const countResult = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: STORY_DAO_CONTRACT,
            functionName: 'get-proposal-count',
            functionArgs: [uintCV(roundId)],
            senderAddress: CONTRACT_ADDRESS,
            network
        });
        
        return []; 
    } catch (e) {
        console.log("Error fetching proposals (Contract might not be deployed yet)", e);
        return [];
    }
}