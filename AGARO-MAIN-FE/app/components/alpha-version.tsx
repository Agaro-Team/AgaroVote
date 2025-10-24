/**
 * Alpha Phase Notice Modal
 *
 * Displays a modal informing users about AgaroChain Alpha Network.
 * Shows network details, RPC configuration, and test wallets for developers.
 */
import { AlertCircle, Copy, InfoIcon, TestTube } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

const ALPHA_NOTICE_KEY = 'agarovote-alpha-notice-dismissed';

const TEST_WALLETS = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
];

const NETWORK_CONFIG = {
  rpc: 'https://agaro-rpc.ardial.tech/',
  chainId: '13377',
  chainName: 'AgaroChain',
  symbol: 'AGO',
};

/**
 * AlphaPhaseNotice Component
 *
 * Shows a modal on first visit explaining the alpha testing phase.
 * Can be dismissed and won't show again (stored in localStorage).
 *
 * @example
 * ```tsx
 * <AlphaPhaseNotice />
 * ```
 */
export function AlphaPhaseNotice({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the notice
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(ALPHA_NOTICE_KEY);
      if (!dismissed) {
        setOpen(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ALPHA_NOTICE_KEY, 'true');
    }
    setOpen(false);
  };

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TestTube className="h-6 w-6 text-blue-500" />
            🧪 AgaroChain Alpha Version
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Please make sure you're connected to our official blockchain platform using the correct
            RPC below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Network Details */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Network Details:</h3>
            <div className="space-y-2 text-sm bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground">RPC:</span>{' '}
                  <code className="font-mono text-foreground">{NETWORK_CONFIG.rpc}</code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(NETWORK_CONFIG.rpc, 'RPC URL')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div>
                <span className="text-muted-foreground">Chain ID:</span>{' '}
                <code className="font-mono text-foreground">{NETWORK_CONFIG.chainId}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Chain Name:</span>{' '}
                <span className="text-foreground">
                  {NETWORK_CONFIG.chainName}{' '}
                  <span className="text-muted-foreground">(optional)</span>
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Symbol:</span>{' '}
                <span className="text-foreground">
                  {NETWORK_CONFIG.symbol} <span className="text-muted-foreground">(optional)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Test Wallets */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Test Wallets (for developers):</h3>
            <div className="space-y-2">
              {TEST_WALLETS.map((wallet, index) => (
                <div
                  key={wallet}
                  className="flex items-center justify-between gap-2 bg-muted/50 rounded p-2 text-xs"
                >
                  <code className="font-mono text-muted-foreground truncate flex-1">{wallet}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(wallet, `Wallet ${index + 1}`)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-600 dark:text-amber-400">Note</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
              This is the <strong>AgaroChain Alpha Network</strong> — use only for testing and
              ensure your wallet RPC matches the address above.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button onClick={handleDismiss} className="w-full sm:w-auto">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const AlphaVersionAlert = () => {
  return (
    <Alert>
      <AlertTitle className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        Alpha Version
      </AlertTitle>

      <AlertDescription className="flex justify-between items-center">
        <p>
          This app is currently in <strong className="text-foreground">alpha testing</strong>,
          features may be unstable, buggy, or subject to change. Your feedback is appreciated!
        </p>

        <AlphaPhaseNotice>
          <Button
            size="sm"
            className="bg-destructive text-white hover:bg-destructive/80 hover:text-white"
          >
            <InfoIcon className="h-4 w-4" />
            Learn More
          </Button>
        </AlphaPhaseNotice>
      </AlertDescription>
    </Alert>
  );
};
