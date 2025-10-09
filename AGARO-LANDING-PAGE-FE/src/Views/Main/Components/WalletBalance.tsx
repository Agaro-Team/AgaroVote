/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/WalletBalance.tsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(
  'https://ethereum-rpc.publicnode.com'
);

const WalletBalance = () => {
  const [address, setAddress] = useState(
    '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
  ); // contoh address
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fungsi fetch balance
  const fetchBalance = async (addr: string) => {
    try {
      setLoading(true);
      setError(null);

      // panggil RPC
      const rawBalance = await provider.getBalance(addr);
      const formatted = ethers.formatEther(rawBalance);
      console.log('formater', ethers);
      console.log('formater', formatted);
      setBalance(formatted);
    } catch (err: any) {
      setError('Gagal mengambil data balance. Periksa alamat wallet.');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  // fetch otomatis saat mount (optional)
  useEffect(() => {
    fetchBalance(address);
  }, []);

  return (
    <div className="p-6 rounded-xl border max-w-md mx-auto mt-10 shadow">
      <h2 className="text-xl font-semibold mb-3">🔍 Cek ETH Balance</h2>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Masukkan alamat wallet..."
        className="w-full border p-2 rounded mb-3"
      />
      <button
        onClick={() => fetchBalance(address)}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
        {loading ? 'Loading...' : 'Cek Balance'}
      </button>

      <div className="mt-4">
        {error && <p className="text-red-500">{error}</p>}
        {balance && !error && (
          <p className="text-green-700">💰 Balance: {balance} ETH</p>
        )}
      </div>
    </div>
  );
};

export default WalletBalance;
