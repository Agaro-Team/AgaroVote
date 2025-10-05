import { useAccount } from 'wagmi';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Spinner } from '~/components/ui/spinner';
import { useCounterUI } from '~/hooks/use-counter-ui';
import { useWeb3Chain } from '~/hooks/use-web3';
import { counterConfig } from '~/lib/web3/contracts/generated';

export function CounterUI() {
  const { address, isConnected } = useAccount();
  const { chainName } = useWeb3Chain();

  const {
    handleIncrement,
    handleIncrementBy,
    isIncrementing,
    isIncrementingBy,
    isConfirming,
    events,
    counterValue,
    isReading,
    incrementByForm,
  } = useCounterUI();

  // Combined loading state: either sending transaction or waiting for confirmation
  const isProcessing = isIncrementing || isIncrementingBy || isConfirming;

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
                Intl.NumberFormat('en-US').format(Number(counterValue?.toString() || '0'))
              )}
            </div>
            {/* Transaction Status Indicator */}
            {isConfirming && (
              <div className="mt-3 text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Spinner className="w-4 h-4" type="ellipsis" />
                Waiting for blockchain confirmation...
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Increment by 1 */}
            <Button onClick={handleIncrement} disabled={isProcessing || isReading}>
              {isIncrementing ? (
                <div className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Sending transaction...
                </div>
              ) : isConfirming ? (
                <div className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  Confirming...
                </div>
              ) : (
                'Increment by 1'
              )}
            </Button>

            {/* Custom Increment */}
            <incrementByForm.AppForm>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleIncrementBy();
                }}
                className="space-y-2"
              >
                <incrementByForm.AppField
                  name="value"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return 'Value is required';
                      if (isNaN(Number(value))) return 'Must be a valid number';
                      if (Number(value) <= 0) return 'Value must be greater than 0';
                      if (!Number.isInteger(Number(value))) return 'Value must be a whole number';
                      if (Number(value) > Number.MAX_SAFE_INTEGER) return 'Value is too large';
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <field.NumberField
                          placeholder="Enter value"
                          description="Increment by custom value (must be a positive whole number)"
                          disabled={isProcessing || isReading}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={
                          isProcessing ||
                          isReading ||
                          field.state.meta.errors.length > 0 ||
                          !field.state.value
                        }
                        className="h-10 mt-0"
                      >
                        {isIncrementingBy ? (
                          <div className="flex items-center gap-2">
                            <Spinner className="w-4 h-4" />
                            Sending...
                          </div>
                        ) : isConfirming ? (
                          <div className="flex items-center gap-2">
                            <Spinner className="w-4 h-4" />
                            Confirming...
                          </div>
                        ) : (
                          'Add'
                        )}
                      </Button>
                    </div>
                  )}
                </incrementByForm.AppField>
              </form>
            </incrementByForm.AppForm>
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
              <div className="font-mono text-xs break-all">{counterConfig.address}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Update this with your deployed contract address
              </div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Network</div>
              <div className="font-mono">{chainName}</div>
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
