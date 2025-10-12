/**
 * Pool Hash Display - Shows pool hash with copy functionality
 */
import { Hash } from 'lucide-react';
import { Button } from '~/components/ui/button';

import { useVoteContext } from '../vote-context';

export function PoolHashDisplay() {
  const { poll } = useVoteContext();

  const handleCopy = () => {
    navigator.clipboard.writeText(poll.poolHash);
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
      <Hash className="h-4 w-4 text-muted-foreground" />
      <code className="text-xs font-mono flex-1">{poll.poolHash}</code>
      <Button variant="ghost" size="sm" onClick={handleCopy}>
        Copy
      </Button>
    </div>
  );
}
