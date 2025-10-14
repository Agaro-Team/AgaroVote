/**
 * Voting Choices - Displays voting options
 */
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';

import { useVoteContext } from '../vote-context';

export function VotingChoices() {
  const { poll, selectedChoiceIndex, canVote, selectChoice } = useVoteContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
        <CardDescription>
          Select your preferred choice below. Your vote will be recorded on the blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {poll.choices.map((choice, index) => (
          <VotingChoice
            key={choice.id}
            choiceText={choice.choiceText}
            index={index}
            isSelected={selectedChoiceIndex === index}
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
  isDisabled: boolean;
  onSelect: (choiceIndex: number) => void;
}

function VotingChoice({ choiceText, index, isSelected, isDisabled, onSelect }: VotingChoiceProps) {
  return (
    <button
      onClick={() => !isDisabled && onSelect(index)}
      disabled={isDisabled}
      className={cn(
        'w-full p-4 rounded-lg border-2 transition-all text-left',
        'hover:border-primary hover:bg-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-transparent',
        isSelected ? 'border-primary bg-accent' : 'border-border'
      )}
    >
      <div className="flex items-center gap-3">
        <RadioButton isSelected={isSelected} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{choiceText}</span>
            <Badge variant="outline" className="text-xs">
              Choice {index + 1}
            </Badge>
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
