import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/context/WalletContext';
import { ethers } from 'ethers';
import { toast } from '@/components/ui/sonner';

export default function PaymentsPage() {
  const { account, connectWallet } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendPayment = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!recipientAddress || !amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Convert amount to wei
      const amountWei = ethers.parseEther(amount);
      
      // Send transaction
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: amountWei,
      });

      toast.success(`Transaction sent! Hash: ${tx.hash}`);
      
      // Wait for confirmation
      await tx.wait();
      toast.success('Transaction confirmed!');
      
      // Reset form
      setAmount('');
      setRecipientAddress('');
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e17] via-[#1a1f2e] to-[#0a0e17]">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-[#1a2230]/90 backdrop-blur-xl border-[#7afcff]/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#7afcff] to-[#6366f1] bg-clip-text text-transparent">
              Send Payment
            </CardTitle>
            <CardDescription className="text-[#9ca3af]">
              Send MNT tokens on Mantle Sepolia testnet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!account ? (
              <div className="text-center py-8">
                <p className="text-[#9ca3af] mb-4">Please connect your wallet to send payments</p>
                <Button onClick={connectWallet} className="bg-gradient-to-r from-[#7afcff] to-[#6366f1]">
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#7afcff]">Recipient Address</label>
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-3 bg-[#0a0e17] border border-[#7afcff]/10 rounded-lg text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#7afcff]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#7afcff]">Amount (MNT)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.000001"
                    className="w-full px-4 py-3 bg-[#0a0e17] border border-[#7afcff]/10 rounded-lg text-[#f3f4f6] focus:outline-none focus:ring-2 focus:ring-[#7afcff]/50"
                  />
                </div>
                <Button
                  onClick={handleSendPayment}
                  disabled={loading || !recipientAddress || !amount}
                  className="w-full bg-gradient-to-r from-[#7afcff] to-[#6366f1] hover:shadow-[0_0_20px_-5px_#7afcff] disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Send Payment'}
                </Button>
                <div className="text-xs text-[#9ca3af] text-center">
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
