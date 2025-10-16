/**
 * Vote Actions - Submit and cancel buttons
 */
import { Vote } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/button';

import { useVoteContext } from '../vote-context';

export function VoteActions() {
  const { selectedChoiceIndex, canVote, isVoting, submitVote, poll, commitToken } =
    useVoteContext();

  const isRequiredToken = poll.isTokenRequired ?? false;
  const isTokenMissing = isRequiredToken && (!commitToken || commitToken.trim() === '');
  const isDisabled =
    typeof selectedChoiceIndex !== 'number' || !canVote || isVoting || isTokenMissing;

  return (
    <div className="flex gap-3">
      <Button size="lg" className="flex-1" disabled={isDisabled} onClick={submitVote}>
        {isVoting ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          <>
            <Vote className="h-4 w-4 mr-2" />
            Submit Vote
          </>
        )}
      </Button>
      <Button variant="outline" size="lg" asChild>
        <Link to="/dashboard/voting-polls">Cancel</Link>
      </Button>
    </div>
  );
}

function Spinner() {
  return (
    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
