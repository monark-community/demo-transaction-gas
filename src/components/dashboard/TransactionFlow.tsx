import { useState } from 'react';
import { Send, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface GasOption {
  type: 'native' | 'sponsored' | 'token';
  title: string;
  description: string;
  fee: string;
  available: boolean;
}

interface TransactionFlowProps {
  onSendTokens: () => void;
  onSponsorTransaction: () => void;
}

export function TransactionFlow({ onSendTokens, onSponsorTransaction }: TransactionFlowProps) {
  const [selectedGasOption, setSelectedGasOption] = useState<GasOption['type']>('native');

  const gasOptions: GasOption[] = [
    {
      type: 'native',
      title: 'Use ETH',
      description: 'Pay gas fees with native tokens',
      fee: '~$2.50',
      available: false,
    },
    {
      type: 'token',
      title: 'Pay with USDC',
      description: 'Convert USDC to pay for gas',
      fee: '~$2.65',
      available: true,
    },
    {
      type: 'sponsored',
      title: 'Sponsored Gas',
      description: 'Get gas fees covered by sponsors',
      fee: 'Free',
      available: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Send Tokens Card */}
      <Card className="bg-gradient-secondary border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Send className="w-5 h-5" />
            Send Tokens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Send tokens even without ETH for gas fees
          </div>
          
          <div className="space-y-3">
            <div className="text-sm font-medium text-foreground">Choose Gas Payment Method:</div>
            {gasOptions.map((option) => (
              <div
                key={option.type}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedGasOption === option.type
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:bg-card-hover'
                } ${!option.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => option.available && setSelectedGasOption(option.type)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedGasOption === option.type && option.available
                        ? 'border-primary bg-primary'
                        : 'border-muted'
                    }`} />
                    <div>
                      <div className="font-medium text-foreground flex items-center gap-2">
                        {option.title}
                        {!option.available && (
                          <Badge variant="secondary" className="text-xs">
                            Insufficient Balance
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {option.fee}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={onSendTokens}
            disabled={!gasOptions.find(opt => opt.type === selectedGasOption)?.available}
            variant="glow"
            className="w-full"
          >
            Continue Transaction
          </Button>
        </CardContent>
      </Card>

      {/* Sponsor Transactions Card */}
      <Card className="bg-gradient-secondary border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5" />
            Sponsor Gas Fees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Help others by covering their transaction fees
          </div>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Active Sponsorships</span>
                <Badge variant="outline" className="text-xs">
                  3 Users
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground">$45.20</div>
              <div className="text-sm text-muted-foreground">Total sponsored this month</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <div className="text-sm font-medium text-primary">12</div>
                <div className="text-xs text-primary/80">Transactions</div>
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-center">
                <div className="text-sm font-medium text-accent">$3.76</div>
                <div className="text-xs text-accent/80">Avg Fee</div>
              </div>
            </div>
          </div>

          <Button 
            onClick={onSponsorTransaction}
            variant="gradient"
            className="w-full"
          >
            <Zap className="w-4 h-4 mr-2" />
            Manage Sponsorship
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}