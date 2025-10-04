import { useAccount } from 'wagmi';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Spinner } from '~/components/ui/spinner';
import {
  useReadCounterX,
  useWatchCounterIncrementEvent,
  useWriteCounterInc,
  useWriteCounterIncBy,
} from '~/lib/web3/contracts/generated';

import { useState } from 'react';

export function CounterUI() {
  const { address, isConnected } = useAccount();
  const [customValue, setCustomValue] = useState('5');
  const [events, setEvents] = useState<string[]>([]);

  // Read counter value
  const { data: counterValue, isLoading: isReading, refetch } = useReadCounterX();

  // Write operations
  const { writeContract: increment, isPending: isIncrementing } = useWriteCounterInc();

  const { writeContract: incrementBy, isPending: isIncrementingBy } = useWriteCounterIncBy();

  // Watch for events
  useWatchCounterIncrementEvent({
    onLogs: (logs) => {
      logs.forEach((log) => {
        const newEvent = `Counter incremented by ${log.args.by} at block ${log.blockNumber}`;
        setEvents((prev) => [newEvent, ...prev.slice(0, 4)]); // Keep last 5 events
      });
    },
  });

  const handleIncrement = async () => {
    try {
      increment({});
      refetch(); // Refresh the counter value
    } catch (error) {
      console.error('Failed to increment:', error);
    }
  };

  const handleIncrementBy = async () => {
    try {
      const value = BigInt(customValue);
      incrementBy({
        args: [value],
      });
      refetch(); // Refresh the counter value
    } catch (error) {
      console.error('Failed to increment by custom value:', error);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Counter Contract</CardTitle>
          <CardDescription>
            Connect your wallet to interact with the Counter smart contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Please connect your wallet to continue</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Counter Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              🔢
            </div>
            Counter Smart Contract
          </CardTitle>
          <CardDescription>Interact with the Counter contract on the blockchain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Counter Value */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">Current Counter Value</div>
            <div className="text-4xl font-bold text-primary">
              {isReading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="w-6 h-6" />
                  Loading...
                </div>
              ) : (
                counterValue?.toString() || '0'
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Increment by 1 */}
            <Button
              onClick={handleIncrement}
              disabled={isIncrementing || isReading}
              className="h-12 text-lg"
              size="lg"
            >
              {isIncrementing ? (
                <div className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Incrementing...
                </div>
              ) : (
                'Increment by 1'
              )}
            </Button>

            {/* Custom Increment */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Enter value"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="flex-1"
                  min="1"
                />
                <Button
                  onClick={handleIncrementBy}
                  disabled={
                    isIncrementingBy || isReading || !customValue || Number(customValue) <= 0
                  }
                  className="h-10"
                >
                  {isIncrementingBy ? <Spinner className="w-4 h-4" /> : 'Add'}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Increment by custom value (must be positive)
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Connected as: <span className="font-mono text-xs">{address}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              📡
            </div>
            Recent Events
          </CardTitle>
          <CardDescription>Live updates from the Counter contract</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No events yet. Try incrementing the counter!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg text-sm font-mono">
                  {event}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              ℹ️
            </div>
            Contract Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Contract Address</div>
              <div className="font-mono text-xs break-all">
                0x0000000000000000000000000000000000000000
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Update this with your deployed contract address
              </div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Network</div>
              <div className="font-mono">Sepolia Testnet</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Functions</div>
              <div className="space-y-1">
                <div className="text-xs">• inc() - Increment by 1</div>
                <div className="text-xs">• incBy(uint256) - Increment by custom value</div>
                <div className="text-xs">• x() - Read current value</div>
              </div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Events</div>
              <div className="text-xs">• Increment(uint256) - Emitted when counter changes</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
