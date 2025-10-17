/**
 * Vote Info Card - Displays information about the voting process
 */
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

import { useVoteContext } from './vote-context';

export function VoteInfoCard() {
  const { poll } = useVoteContext();

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-base">About This Vote</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <InfoItem>
          Your vote will be recorded on the blockchain and cannot be changed once submitted.
        </InfoItem>
        <InfoItem>
          You'll need to confirm the transaction in your wallet and pay a small gas fee.
        </InfoItem>
        <InfoItem>After voting, you may be eligible for synthetic staking rewards.</InfoItem>
        {poll.isPrivate && (
          <InfoItem className="text-orange-600 dark:text-orange-400">
            This is a private poll - only allowed wallet addresses can participate.
          </InfoItem>
        )}
      </CardContent>
    </Card>
  );
}

function InfoItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>• {children}</p>;
}
