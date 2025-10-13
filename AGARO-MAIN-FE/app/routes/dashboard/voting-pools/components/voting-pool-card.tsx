/**
 * Voting Pool Card Component
 *
 * Displays a single voting pool with its details and actions.
 */
import { Calendar, CheckCircle2, TrendingUp, Users, Vote } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';

export interface VotingPoolCardProps {
  id: string;
  poolHash: string;
  title: string;
  description: string;
  choices: string[];
  totalVotes: number;
  status: 'active' | 'completed' | 'pending';
  createdAt?: Date;
  endsAt?: Date;
}

export function VotingPoolCard({
  id,
  poolHash,
  title,
  description,
  choices,
  totalVotes,
  status,
  createdAt,
  endsAt,
}: VotingPoolCardProps) {
  const statusConfig = {
    active: { label: 'Active', variant: 'default' as const, icon: Vote },
    completed: { label: 'Completed', variant: 'secondary' as const, icon: CheckCircle2 },
    pending: { label: 'Pending', variant: 'outline' as const, icon: TrendingUp },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h3 className="text-xl font-semibold leading-none tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          </div>
          <Badge variant={config.variant} className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{choices.length} choices</span>
          </div>
          <div className="flex items-center gap-1">
            <Vote className="h-4 w-4" />
            <span>{totalVotes.toLocaleString()} votes</span>
          </div>
          {createdAt && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{createdAt.toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Choices Preview */}
        <div className="flex flex-wrap gap-2">
          {choices.slice(0, 3).map((choice, index) => (
            <Badge key={index} variant="outline">
              {choice}
            </Badge>
          ))}
          {choices.length > 3 && <Badge variant="outline">+{choices.length - 3} more</Badge>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button asChild className="flex-1">
            <Link to={`/dashboard/voting-pools/${id}`}>
              {status === 'active' ? 'Vote Now' : 'View Results'}
            </Link>
          </Button>
        </div>

        {/* Pool Hash */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground font-mono">
            Hash: {poolHash.slice(0, 10)}...{poolHash.slice(-8)}
          </p>
        </div>
      </div>
    </Card>
  );
}
