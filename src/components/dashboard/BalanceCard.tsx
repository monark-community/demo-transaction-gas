import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Balance {
  symbol: string;
  amount: string;
  value: string;
  change: string;
  changeType: 'up' | 'down';
  icon?: string;
}

interface BalanceCardProps {
  balances: Balance[];
  totalValue: string;
}

export function BalanceCard({ balances, totalValue }: BalanceCardProps) {
  return (
    <Card className="bg-gradient-secondary border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Portfolio Balance</CardTitle>
        <div className="text-3xl font-bold text-foreground">{totalValue}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.map((balance, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{balance.symbol[0]}</span>
              </div>
              <div>
                <div className="font-medium text-foreground">{balance.symbol}</div>
                <div className="text-sm text-muted-foreground">{balance.amount}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-foreground">{balance.value}</div>
              <Badge 
                variant={balance.changeType === 'up' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {balance.changeType === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {balance.change}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}