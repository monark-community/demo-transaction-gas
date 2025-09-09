import { useState } from 'react';
import { Wallet, Shield, Zap, ArrowRight, Github, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { TransactionFlow } from '@/components/dashboard/TransactionFlow';
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>();

  // Mock data for demo
  const mockBalances = [
    { symbol: 'ETH', amount: '0.00 ETH', value: '$0.00', change: '-2.5%', changeType: 'down' as const },
    { symbol: 'USDC', amount: '150.00 USDC', value: '$150.00', change: '+0.1%', changeType: 'up' as const },
    { symbol: 'USDT', amount: '75.50 USDT', value: '$75.50', change: '+0.0%', changeType: 'up' as const },
  ];

  const handleConnect = async () => {
    // Simulate wallet connection
    setIsConnected(true);
    setWalletAddress('0x742d35Cc4734C0532925c3b8b9e8g7c8ceF2796');
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress(undefined);
  };

  const handleSendTokens = () => {
    console.log('Send tokens flow initiated');
  };

  const handleSponsorTransaction = () => {
    console.log('Sponsor transaction flow initiated');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        {/* Header */}
        <header className="flex justify-between items-center p-6 lg:p-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FlexGas</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#docs" className="hover:text-foreground transition-colors">Docs</a>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 lg:px-8 py-12 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/20">
                  Web3 Gas Solutions
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Transact Without
                  <span className="bg-gradient-primary bg-clip-text text-transparent"> Gas Barriers</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  FlexGas eliminates gas token requirements. Send transactions even without ETH by using sponsored gas or paying with your held tokens like USDC.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <WalletConnect
                  isConnected={isConnected}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                />
                <Button variant="outline" size="lg" className="border-border bg-card hover:bg-card-hover">
                  View Documentation
                </Button>
              </div>
            </div>

            <div className="relative">
              <img 
                src={heroBg} 
                alt="Web3 Network Visualization"
                className="w-full h-auto rounded-2xl shadow-elevated"
              />
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl"></div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-secondary border-border shadow-card">
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-foreground">Sponsored Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get your transaction fees covered by sponsors in the network. Transact for free when sponsors are available.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-secondary border-border shadow-card">
              <CardHeader>
                <Wallet className="w-8 h-8 text-accent mb-2" />
                <CardTitle className="text-foreground">Multi-Token Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Pay gas fees using USDC, USDT, or other tokens you hold. No need for native ETH to complete transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-secondary border-border shadow-card">
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-foreground">Seamless Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  One-click transactions with automatic gas optimization. FlexGas handles the complexity behind the scenes.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">FlexGas</span>
                <span className="text-muted-foreground">© 2024</span>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">FlexGas</span>
            </div>
            <WalletConnect
              isConnected={isConnected}
              address={walletAddress}
              network="Ethereum Sepolia"
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
            <p className="text-muted-foreground">
              Manage your assets and transact without gas barriers
            </p>
          </div>

          {/* Balance Overview */}
          <BalanceCard balances={mockBalances} totalValue="$225.50" />

          {/* Transaction Actions */}
          <TransactionFlow 
            onSendTokens={handleSendTokens}
            onSponsorTransaction={handleSponsorTransaction}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
