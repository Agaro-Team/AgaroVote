/**
 * Poll Hash Display - Shows poll hash with copy functionality
 */
import { CheckCircle2, Copy, CopyCheckIcon, Hash } from 'lucide-react';
import { Button } from '~/components/ui/button';

import { useState } from 'react';

import { useVoteContext } from './vote-context';

export function PollHashDisplay() {
  const { poll } = useVoteContext();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(poll.pollHash).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
      <Hash className="h-4 w-4 text-muted-foreground" />
      <code className="text-xs font-mono flex-1">
        {poll.pollHash.slice(0, 6)}...{poll.pollHash.slice(-4)}
      </code>
      <Button variant="ghost" size="sm" onClick={handleCopy}>
        {isCopied ? (
          <CopyCheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
