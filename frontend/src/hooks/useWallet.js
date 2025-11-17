import { useState, useEffect, useCallback } from 'react';

export const useWallet = () => {
  const [wallets, setWallets] = useState([]);
  const [walletApi, setWalletApi] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [walletAddress, setWalletAddress] = useState(''); // Hex format
  const [walletAddressBech32, setWalletAddressBech32] = useState(''); // Bech32 format (addr1...)
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async (walletName) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      if (!walletName || !window.cardano[walletName]) {
        throw new Error('Wallet not found');
      }

      console.log('Connecting to wallet:', walletName);
      const api = await window.cardano[walletName].enable();
      setWalletApi(api);
      setSelectedWallet(walletName);
      
      // Get wallet address (hex format from CIP-30)
      const addressHex = await api.getChangeAddress();
      setWalletAddress(addressHex);
      
      // Get bech32 address for display - use Mesh SDK BrowserWallet
      try {
        const { BrowserWallet } = await import('@meshsdk/core');
        const browserWallet = await BrowserWallet.enable(walletName);
        const usedAddresses = await browserWallet.getUsedAddresses();
        const bech32Address = usedAddresses[0] || '';
        setWalletAddressBech32(bech32Address);
        console.log('Wallet address (bech32):', bech32Address);
      } catch (err) {
        console.warn('Failed to get bech32 address:', err);
        setWalletAddressBech32(''); // Fallback to empty
      }
      
      setIsConnected(true);
      
      // Save connected wallet to localStorage for persistence
      localStorage.setItem('connectedWallet', walletName);
      
      console.log('Connected to wallet:', walletName);
      console.log('Wallet address (hex):', addressHex);
      
      return { api, address: addressHex };
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      setError(err.message || 'Failed to connect wallet');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Detect available wallets and auto-reconnect if previously connected
  useEffect(() => {
    if (window.cardano) {
      const availableWallets = Object.keys(window.cardano);
      setWallets(availableWallets);
      console.log('Available wallets:', availableWallets);
      
      // Try to auto-reconnect to previously connected wallet
      const savedWalletName = localStorage.getItem('connectedWallet');
      if (savedWalletName && availableWallets.includes(savedWalletName)) {
        console.log('Auto-reconnecting to wallet:', savedWalletName);
        connectWallet(savedWalletName).catch(err => {
          console.log('Auto-reconnect failed:', err);
          // Clear saved wallet if auto-reconnect fails
          localStorage.removeItem('connectedWallet');
        });
      }
    } else {
      console.log('No Cardano wallets found');
    }
  }, [connectWallet]);

  const disconnectWallet = () => {
    setWalletApi(null);
    setWalletAddress('');
    setWalletAddressBech32('');
    setSelectedWallet('');
    setIsConnected(false);
    setError(null);
    
    // Remove wallet from localStorage
    localStorage.removeItem('connectedWallet');
    console.log('Wallet disconnected');
  };

  return {
    wallets,
    walletApi,
    selectedWallet,
    walletAddress,
    walletAddressBech32,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  };
};

