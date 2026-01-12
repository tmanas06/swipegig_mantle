import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Common ERC-20 tokens on Mantle Sepolia
const COMMON_TOKENS = [
  {
    address: '0x0000000000000000000000000000000000000000', // Native MNT
    symbol: 'MNT',
    name: 'Mantle',
    decimals: 18,
  },
  {
    address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9', // USDC on Mantle Sepolia (example)
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
];

export const TokenSelector = ({ onSelect }: { onSelect: (token: string) => void }) => {
  const [customToken, setCustomToken] = useState('');
  const [selectedToken, setSelectedToken] = useState('');

  const handleTokenSelect = (value: string) => {
    setSelectedToken(value);
    if (value === 'custom') {
      onSelect(customToken);
    } else {
      onSelect(value);
    }
  };

  const handleCustomTokenChange = (value: string) => {
    setCustomToken(value);
    if (selectedToken === 'custom') {
      onSelect(value);
    }
  };

  // Basic Ethereum address validation
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  return (
    <div className="space-y-4">
      <Label>Payment Token</Label>
      <Select onValueChange={handleTokenSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select payment token" />
        </SelectTrigger>
        <SelectContent>
          {COMMON_TOKENS.map((token) => (
            <SelectItem key={token.address} value={token.address}>
              <div className="flex items-center gap-2">
                <span>{token.symbol} - {token.name}</span>
              </div>
            </SelectItem>
          ))}
          <SelectItem value="custom">
            <div className="text-gray-400">
              Other (Enter custom token address)
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Token Input */}
      {selectedToken === 'custom' && (
        <Input
          placeholder="Enter ERC-20 token address (0x...)"
          value={customToken}
          onChange={(e) => handleCustomTokenChange(e.target.value)}
          className={customToken && !isValidAddress(customToken) ? 'border-red-200' : ''}
        />
      )}

      {/* Validation Message */}
      {customToken && !isValidAddress(customToken) && (
        <div className="text-sm text-red-500 p-2 bg-red-50 rounded-lg">
          ⚠️ Invalid Ethereum address format. Please enter a valid ERC-20 token address.
        </div>
      )}
    </div>
  );
};
