import React from 'react';
import { useWallet } from '@/context/WalletContext';
import { Button } from './ui/button';

export const WalletConnectButton = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleDisconnect = () => {
    try {
      disconnectWallet();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Truncate the address for display
  const displayAddress = account ? 
    `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 
    '';

  return (
    <div className="flex items-center space-x-2">
      {account ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{displayAddress}</span>
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button onClick={handleConnect}>
          Connect Wallet
        </Button>
      )}
    </div>
  );
};
