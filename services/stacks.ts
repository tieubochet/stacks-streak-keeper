// services/stacks.ts
import { 
  callReadOnlyFunction, 
  uintCV, 
  stringUtf8CV,
  ClarityType
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { PostConditionMode } from '@stacks/transactions';



export const STORY_DAO_CONTRACT = 'story-dao'; 

export const submitProposal = async (content: string, onFinish: (data: any) => void) => {
  const network = new StacksMainnet(); 
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
  const network = new StacksMainnet();
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
    const network = new StacksMainnet();
    const countResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: STORY_DAO_CONTRACT,
        functionName: 'get-proposal-count',
        functionArgs: [uintCV(roundId)],
        senderAddress: CONTRACT_ADDRESS,
        network
    });
    
    const count = Number((countResult as any).value);
    const proposals = [];
    
    for(let i = 1; i <= count; i++) {
        const res = await callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: STORY_DAO_CONTRACT,
            functionName: 'get-proposal',
            functionArgs: [uintCV(roundId), uintCV(i)],
            senderAddress: CONTRACT_ADDRESS,
            network
        });
        
        if (res.type === ClarityType.OptionalSome) {
            const data = (res.value as any).data;
            proposals.push({
                id: i,
                content: data.content.value,
                author: data.author.value,
                votes: Number(data.votes.value)
            });
        }
    }
    return proposals;
}