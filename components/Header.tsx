import { useState } from 'react';
import { connectReown } from '../services/reown';

export function Header() {
  const [userAddress, setUserAddress] = useState("");

  const handleConnect = async () => {
    const session = await connectReown();
    if (session) {
      // Lấy địa chỉ ví Stacks từ session namespace
      const accounts = session.namespaces['stacks']?.accounts;
      if (accounts && accounts.length > 0) {
        // Account format: stacks:1:ADDRESS
        const address = accounts[0].split(':')[2];
        setUserAddress(address);
      }
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <div className="font-bold text-xl">🔥 Stacks Streak</div>
      <button 
        onClick={handleConnect}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
      >
        {userAddress ? `Connected: ${userAddress.slice(0,6)}...` : "Connect Wallet (Reown)"}
      </button>
    </header>
  );
}