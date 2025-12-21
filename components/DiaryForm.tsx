import { useState } from "react";
import { openContractCall, useConnect } from "@stacks/connect-react";
import { bufferCV, stringAsciiCV } from "@stacks/transactions";
import { diaryContractAddress, diaryContractName } from "../services/constants";

export function DiaryForm() {
  const { doOpenAuth } = useConnect();
  const [word, setWord] = useState("");

  const handleAddWord = () => {
    if (!word) return;

    openContractCall({
      contractAddress: diaryContractAddress,
      contractName: diaryContractName,
      functionName: "add-word",
      functionArgs: [
        stringAsciiCV(word),
      ],
      postConditionMode: 1,
      onFinish: (tx) => {
        console.log("Diary tx submitted:", tx);
        alert("Sent, wait for block!");
      },
      appDetails: {
        name: "Stacks Streak Keeper",
        icon: window.location.origin + "/favicon.ico",
      },
    });
  };

  return (
    <div className="p-4 border rounded shadow-md">
      <h2 className="text-xl font-bold mb-2">Add Diary Word</h2>
      <input
        type="text"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Enter a word"
        className="border p-2 rounded w-full"
      />
      <button
        onClick={handleAddWord}
        className="bg-blue-600 text-white p-2 mt-2 rounded"
      >
        Add Word
      </button>
    </div>
  );
}
