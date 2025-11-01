/**
 * Voting Poll Card Component
 *
 * Displays a single voting poll with its details and actions.
 * Fully responsive with text truncation and tooltips.
 */
import { Calendar, CheckCircle2, TrendingUp, Users, Vote } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { useWeb3Wallet } from '~/hooks/use-web3';
import { queryClient } from '~/lib/query-client/config';
import { pollDetailQueryOptions } from '~/lib/query-client/poll/queries';
import { checkHasVotedQueryOptions } from '~/lib/query-client/vote/queries';
import { Link } from '~/lib/utils/navigation';

export interface VotingPollCardProps {
  id: string;
  pollHash: string;
  title: string;
  description: string;
  choices: string[];
  totalVotes: number;
  status: 'active' | 'completed' | 'pending';
  createdAt?: Date;
  endsAt?: Date;
}

export function VotingPollCard({
  id,
  pollHash,
  title,
  description,
  choices,
  totalVotes,
  status,
  createdAt,
  endsAt,
}: VotingPollCardProps) {
  const { address: walletAddress } = useWeb3Wallet();
  const statusConfig = {
    active: { label: 'Active', variant: 'default' as const, icon: Vote },
    completed: { label: 'Completed', variant: 'secondary' as const, icon: CheckCircle2 },
    pending: { label: 'Pending', variant: 'outline' as const, icon: TrendingUp },
  };

  const prefetchPoll = async (id: string) => {
    // Prefetch queries in parallel for better performance
    const queries = [queryClient.prefetchQuery(pollDetailQueryOptions(id))];

    if (walletAddress) {
      queries.push(queryClient.prefetchQuery(checkHasVotedQueryOptions(id, walletAddress)));
    }

    await Promise.all(queries);
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Check if text needs truncation
  const isTitleLong = title.length > 50;
  const isDescriptionLong = description.length > 120;

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow w-full overflow-hidden">
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              {/* Title with tooltip */}
              {isTitleLong ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="text-lg sm:text-xl font-semibold leading-tight tracking-tight truncate cursor-help">
                      {title}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs sm:max-w-md">
                    <p className="text-sm">{title}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <h3 className="text-lg sm:text-xl font-semibold leading-tight tracking-tight">
                  {title}
                </h3>
              )}

              {/* Description with tooltip */}
              {isDescriptionLong ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-muted-foreground line-clamp-2 cursor-help">
                      {description}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs sm:max-w-md">
                    <p className="text-sm">{description}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
              )}
            </div>

            {/* Status Badge - Responsive positioning */}
            <Badge variant={config.variant} className="gap-1 shrink-0 self-start">
              <StatusIcon className="h-3 w-3" />
              <span className="hidden xs:inline">{config.label}</span>
              <span className="inline xs:hidden">{config.label.slice(0, 4)}</span>
            </Badge>
          </div>

          {/* Stats - Responsive grid */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 min-w-0">
              <Users className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {choices.length} {choices.length === 1 ? 'choice' : 'choices'}
              </span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <Vote className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {totalVotes.toLocaleString()} {totalVotes === 1 ? 'vote' : 'votes'}
              </span>
            </div>
            {createdAt && (
              <div className="flex items-center gap-1 min-w-0 col-span-2 sm:col-span-1">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="truncate text-xs sm:text-sm">
                  {createdAt.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Choices Preview - Responsive wrapping */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {choices.slice(0, 3).map((choice, index) => {
              const isChoiceLong = choice.length > 20;
              return isChoiceLong ? (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="max-w-[120px] sm:max-w-[150px] truncate cursor-help text-xs"
                    >
                      {choice}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">{choice}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Badge key={index} variant="outline" className="text-xs">
                  {choice}
                </Badge>
              );
            })}
            {choices.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{choices.length - 3} more
              </Badge>
            )}
          </div>

          {/* Actions - Full width button on mobile */}
          <div className="flex items-center gap-2 pt-2">
            <Button asChild className="w-full sm:flex-1" size="default">
              <Link to={`/dashboard/voting-polls/${id}`} onMouseEnter={() => prefetchPoll(id)}>
                {status === 'active' ? 'Vote Now' : 'View Results'}
              </Link>
            </Button>
          </div>

          {/* Poll Hash - Responsive with tooltip */}
          <div className="pt-2 border-t">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground font-mono truncate cursor-help w-fit">
                  <span className="hidden sm:inline">Hash: </span>
                  {pollHash.slice(0, 6)}...{pollHash.slice(-6)}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-mono break-words max-w-xs">{pollHash}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}
