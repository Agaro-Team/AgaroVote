import { AlertCircle, Gift } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Field, FieldError, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

import { useVoteContext } from './vote-context';

const getFormattedNumberInputProps = (
  value: string,
  onCommitTokenChange: (token: string) => void
): React.ComponentProps<typeof Input> => {
  const formatValue = (value: string) => {
    //     // Format for display: add thousand separators
    if (!value || value === '') return '';
    const numValue = Number(value);
    if (isNaN(numValue)) return value;
    return Intl.NumberFormat('en-US').format(numValue);
  };

  const formatValueOnChange = (value: string) => {
    // Remove all non-numeric characters except decimals for storage
    const cleaned = value.replace(/[^\d.]/g, '');
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };
  return {
    value: formatValue(value),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onCommitTokenChange
        ? onCommitTokenChange(formatValueOnChange(e.target.value))
        : formatValueOnChange(e.target.value),
  };
};

export function CommitTokenInput() {
  const { poll, commitToken, setCommitToken, canVote, isVoting, hasVoted } = useVoteContext();

  const hasRewardShare = Boolean(poll.rewardShare && poll.rewardShare > 0);
  const isRequiredToken = poll.isTokenRequired ?? false;

  const isDisabled = !canVote || isVoting || hasVoted;
  const hasError = !isDisabled && isRequiredToken && (!commitToken || commitToken.trim() === '');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Commit Token
          {hasRewardShare && (
            <Badge variant="secondary" className="text-xs">
              <Gift className="mr-1 h-3 w-3" />
              Rewards Available
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Commit your token to vote.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasRewardShare && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-900 dark:text-green-100">
              Earn Incentives by Voting!
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              <p className="text-sm">
                This poll has a reward share of{' '}
                <strong>{Intl.NumberFormat('en-US').format(poll.rewardShare ?? 0)}</strong> by
                participating in this vote, you'll earn incentives through our synthetic staking
                reward mechanism. Your voice matters and is rewarded!
              </p>
            </AlertDescription>
          </Alert>
        )}
        <Field orientation="vertical" data-invalid={hasError}>
          <FieldLabel aria-required={isRequiredToken} htmlFor="token-amount">
            Token Amount {isRequiredToken && <span className="text-destructive">*</span>}
          </FieldLabel>
          <Input
            {...getFormattedNumberInputProps(commitToken ?? '', setCommitToken)}
            aria-required={isRequiredToken}
            aria-invalid={hasError}
            data-invalid={hasError}
            id="token-amount"
            disabled={isDisabled}
            placeholder="Enter your token amount"
            type="text"
          />
          {hasError && (
            <FieldError>Token amount is required to cast your vote in this poll.</FieldError>
          )}
        </Field>
      </CardContent>
    </Card>
  );
}
