/**
 * Component to display the user's voted choice
 */
import { CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { formatDate } from '~/lib/date-utils';

import { useMemo } from 'react';

import { useVoteContext } from './vote-context';

export function UserVotedChoice() {
  const { poll, hasVoted, userVotedChoiceId, isLoadingUserVote } = useVoteContext();

  const votedChoice = useMemo(() => {
    if (!userVotedChoiceId) return null;
    return poll.choices.find((choice) => choice.id === userVotedChoiceId);
  }, [poll.choices, userVotedChoiceId]);

  if (isLoadingUserVote) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription>Loading your vote...</AlertDescription>
      </Alert>
    );
  }

  if (!hasVoted || !votedChoice) {
    return null;
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-900">You have voted!</AlertTitle>
      <AlertDescription className="text-green-800">
        <div className="mt-2 space-y-1">
          <p className="font-semibold">Your choice: {votedChoice.choiceText}</p>
          <p className="text-sm text-green-700">
            Thank you for participating in this poll. Your vote has been recorded on the blockchain.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
