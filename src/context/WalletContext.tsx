import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';

// Mantle Sepolia Testnet configuration
const MANTLE_SEPOLIA = {
  chainId: '0x138b', // 5003 in hexadecimal
  chainName: 'Mantle Sepolia',
  rpcUrls: ['https://rpc.sepolia.mantle.xyz'],
  nativeCurrency: {
    name: 'Mantle',
    symbol: 'MNT',
    decimals: 18
  },
  blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz']
};

const MANTLE_SEPOLIA_CHAIN_ID = '0x138b'; // 5003 in hex
const MANTLE_SEPOLIA_CHAIN_ID_DECIMAL = 5003;

type WalletContextType = {
  account: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  userRole: 'freelancer' | 'client' | null;
  setUserRole: (role: 'freelancer' | 'client' | null) => void;
  networkId: number | null;
};

const WalletContext = createContext<WalletContextType>({
  account: null,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  userRole: null,
  setUserRole: () => {},
  networkId: null,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'freelancer' | 'client' | null>(null);
  const [networkId, setNetworkId] = useState<number | null>(null);

  const switchToMantleSepolia = useCallback(async (showToast = true) => {
    if (!window.ethereum) return false;
    
    try {
      // Check current chain ID
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // If already on Mantle Sepolia, no need to switch
      if (currentChainId === MANTLE_SEPOLIA_CHAIN_ID) {
        setNetworkId(MANTLE_SEPOLIA_CHAIN_ID_DECIMAL);
        return true;
      }
      
      // Try to switch to Mantle Sepolia
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MANTLE_SEPOLIA_CHAIN_ID }],
        });
        setNetworkId(MANTLE_SEPOLIA_CHAIN_ID_DECIMAL);
        if (showToast) {
          toast.success('Switched to Mantle Sepolia');
        }
        return true;
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            // Add the Mantle Sepolia network
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [MANTLE_SEPOLIA],
            });
            setNetworkId(MANTLE_SEPOLIA_CHAIN_ID_DECIMAL);
            if (showToast) {
              toast.success('Mantle Sepolia added and switched successfully');
            }
            return true;
          } catch (addError) {
            console.error('Error adding Mantle Sepolia:', addError);
            if (showToast) {
              toast.error('Failed to add Mantle Sepolia to your wallet. Please add it manually.');
            }
            return false;
          }
        } else if (switchError.code === 4001) {
          // User rejected the request
          if (showToast) {
            toast.info('Please switch to Mantle Sepolia to use this application');
          }
          return false;
        } else {
          console.error('Error switching to Mantle Sepolia:', switchError);
          if (showToast) {
            toast.error('Failed to switch to Mantle Sepolia');
          }
          return false;
        }
      }
    } catch (error) {
      console.error('Error checking chain:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Check if user was previously connected
    const savedAccount = localStorage.getItem('walletAccount');
    const savedRole = localStorage.getItem('userRole') as 'freelancer' | 'client' | null;
    
    if (savedAccount) {
      setAccount(savedAccount);
    }
    
    if (savedRole) {
      setUserRole(savedRole);
    }

    // Setup network change listener and auto-switch to Mantle Sepolia
    if (window.ethereum) {
      const handleChainChanged = async (chainId: string) => {
        const currentChainId = parseInt(chainId, 16);
        setNetworkId(currentChainId);
        
        // Automatically switch to Mantle Sepolia if on wrong network
        if (currentChainId !== MANTLE_SEPOLIA_CHAIN_ID_DECIMAL) {
          await switchToMantleSepolia(false); // Silent switch on chain change
        }
      };
      
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Check initial network and switch if needed
      window.ethereum.request({ method: 'eth_chainId' })
        .then(async (chainId: string) => {
          const currentChainId = parseInt(chainId, 16);
          setNetworkId(currentChainId);
          
          // If wallet is already connected but on wrong network, switch automatically
          if (savedAccount && currentChainId !== MANTLE_SEPOLIA_CHAIN_ID_DECIMAL) {
            await switchToMantleSepolia(false); // Silent switch on page load
          }
        })
        .catch(console.error);
        
      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [switchToMantleSepolia]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected! Please install MetaMask to connect.');
      return;
    }

    setIsConnecting(true);

    try {
      // Request accounts first
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get current accounts
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        localStorage.setItem('walletAccount', accounts[0]);
        
        // Automatically switch to Mantle Sepolia (silently if already connected)
        await switchToMantleSepolia(true);
        
        // Get current network after switch attempt
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setNetworkId(parseInt(chainId, 16));
        
        // Only show success if we're on the right network
        if (parseInt(chainId, 16) === MANTLE_SEPOLIA_CHAIN_ID_DECIMAL) {
          toast.success('Connected to Mantle Sepolia successfully!');
        }
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.info('Wallet connection cancelled');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setUserRole(null);
    setNetworkId(null);
    localStorage.removeItem('walletAccount');
    localStorage.removeItem('userRole');
    toast.info('Wallet disconnected');
  };

  const handleRoleChange = (role: 'freelancer' | 'client' | null) => {
    setUserRole(role);
    if (role) {
      localStorage.setItem('userRole', role);
    } else {
      localStorage.removeItem('userRole');
    }
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnecting,
        connectWallet,
        disconnectWallet,
        userRole,
        setUserRole: handleRoleChange,
        networkId,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}
