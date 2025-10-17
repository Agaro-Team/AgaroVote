/**
 * Voting Choices - Displays voting options
 */
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';

import { useVoteContext } from './vote-context';

export function VotingChoices() {
  const { poll, selectedChoiceIndex, canVote, selectChoice, hasVoted, userVotedChoiceId } =
    useVoteContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hasVoted ? 'Your Vote' : 'Cast Your Vote'}</CardTitle>
        <CardDescription>
          {hasVoted
            ? 'You have already voted in this poll. Your choice is highlighted below.'
            : 'Select your preferred choice below. Your vote will be recorded on the blockchain.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {poll.choices.map((choice, index) => (
          <VotingChoice
            key={choice.id}
            choiceText={choice.choiceText}
            index={index}
            isSelected={selectedChoiceIndex === index}
            isUserVoted={hasVoted && userVotedChoiceId === choice.id}
            isDisabled={!canVote}
            onSelect={(choiceIndex) => selectChoice(choiceIndex, choice.id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface VotingChoiceProps {
  choiceText: string;
  index: number;
  isSelected: boolean;
  isUserVoted: boolean;
  isDisabled: boolean;
  onSelect: (choiceIndex: number) => void;
}

function VotingChoice({
  choiceText,
  index,
  isSelected,
  isUserVoted,
  isDisabled,
  onSelect,
}: VotingChoiceProps) {
  return (
    <button
      onClick={() => !isDisabled && onSelect(index)}
      disabled={isDisabled}
      className={cn(
        'w-full p-4 rounded-lg border-2 transition-all text-left',
        'hover:border-primary hover:bg-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-transparent',
        isUserVoted && 'border-green-500 bg-green-50 dark:bg-green-950',
        !isUserVoted && isSelected && 'border-primary bg-accent',
        !isUserVoted && !isSelected && 'border-border'
      )}
    >
      <div className="flex items-center gap-3">
        {isUserVoted ? (
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
        ) : (
          <RadioButton isSelected={isSelected} />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn('font-medium', isUserVoted && 'text-green-900 dark:text-green-100')}
            >
              {choiceText}
            </span>
            <Badge variant="outline" className="text-xs">
              Choice {index + 1}
            </Badge>
            {isUserVoted && (
              <Badge className="bg-green-600 hover:bg-green-700 text-xs">Your Vote</Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function RadioButton({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className={cn(
        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
      )}
    >
      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
    </div>
  );
}
