import { useState } from 'react';
import { Wallet, ChevronDown, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WalletConnectProps {
  isConnected: boolean;
  address?: string;
  network?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletConnect({ 
  isConnected, 
  address, 
  network = 'Ethereum',
  onConnect, 
  onDisconnect 
}: WalletConnectProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={isLoading}
        variant="hero"
        size="lg"
        className="shadow-card"
      >
        <Wallet className="w-5 h-5" />
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-card border-border hover:bg-card-hover">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-success rounded-full" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{formatAddress(address!)}</span>
              <Badge variant="secondary" className="text-xs">
                {network}
              </Badge>
            </div>
            <ChevronDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-popover border-border" align="end">
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDisconnect} className="text-destructive">
          <Wallet className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}