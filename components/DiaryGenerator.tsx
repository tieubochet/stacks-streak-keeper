import { useState } from "react";
import {
  openContractCall,
} from "@stacks/connect";
import {
  callReadOnlyFunction,
  stringAsciiCV,
  principalCV,
  cvToValue,
} from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";

const network = new StacksMainnet();

const CONTRACT_ADDRESS = "SPHMWZQ1KW03KHYPADC81Q6XXS284S7QCHRAS3A8";
const CONTRACT_NAME = "diary-v1";

export default function DiaryGenerator({ userAddress }: { userAddress: string }) {
  const [word, setWord] = useState("");
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addWord = async () => {
    if (!word) return;
    setLoading(true);

    await openContractCall({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "add-word",
      functionArgs: [stringAsciiCV(word)],
      onFinish: async () => {
        await fetchStory();
        setWord("");
        setLoading(false);
      },
      onCancel: () => {
        setLoading(false);
      },
    });
  };

  const fetchStory = async () => {
    const result = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-latest-story",
      functionArgs: [principalCV(userAddress)],
      senderAddress: userAddress,
    });

    const value = cvToValue(result);
    if (value.value) {
      setStory(value.value);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h2 className="text-xl font-semibold mb-2">📓 On-chain Diary</h2>

      <input
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Add a word..."
        className="border rounded w-full p-2 mb-2"
      />

      <button
        onClick={addWord}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Generating..." : "Add word"}
      </button>

      {story && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          {story}
        </div>
      )}
    </div>
  );
}
