/**
 * Share Voting Pool Modal Component
 *
 * Displays a modal with a shareable link to the newly created voting pool.
 * Includes copy-to-clipboard functionality.
 */
import { CheckIcon, CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';

import { useState } from 'react';

interface ShareVotingPoolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  onClose: () => void;
}

export function ShareVotingPoolModal({
  open,
  onOpenChange,
  id,
  onClose,
}: ShareVotingPoolModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate the full URL
  const shareUrl = `${window.location.origin}/dashboard/voting-pools/${id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy link');
      console.error('Failed to copy:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Voting Pool</DialogTitle>
          <DialogDescription>
            Your voting pool has been created successfully! Share this link with others to let them
            participate.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              id="share-link"
              value={shareUrl}
              readOnly
              className="font-mono text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="px-3"
            onClick={handleCopyLink}
            disabled={copied}
          >
            {copied ? (
              <>
                <CheckIcon className="h-4 w-4" />
                <span className="sr-only">Copied</span>
              </>
            ) : (
              <>
                <CopyIcon className="h-4 w-4" />
                <span className="sr-only">Copy</span>
              </>
            )}
          </Button>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={handleClose} className="w-full">
            Close and View Pools
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
