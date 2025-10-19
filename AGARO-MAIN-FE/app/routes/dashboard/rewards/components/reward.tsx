import { Clock } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { ClientDate } from '~/components/ui/client-date';
import type { Reward as RewardType } from '~/lib/api/reward/reward.interface';
import { dayjs } from '~/lib/date-utils';
import { cn } from '~/lib/utils';

import { createContext, useContext } from 'react';

interface RewardContextType {
  reward: RewardType;
}

const RewardContext = createContext<RewardContextType | null>(null);

interface RewardRootProps {
  reward: RewardType;
  children: React.ReactNode;
  className?: string;
}

/**
 * Root component that provides reward context to all child components
 * @example
 * <Reward reward={reward}>
 *   <Reward.Card>
 *     <Reward.Header>
 *       <Reward.Title />
 *       <Reward.StatusBadge />
 *     </Reward.Header>
 *     <Reward.Content>
 *       <Reward.TimeRemaining />
 *     </Reward.Content>
 *   </Reward.Card>
 * </Reward>
 */
function RewardRoot({ reward, children, className }: RewardRootProps) {
  return (
    <RewardContext.Provider value={{ reward }}>
      <div className={cn('reward-wrapper', className)}>{children}</div>
    </RewardContext.Provider>
  );
}

export const useRewardContext = () => {
  const context = useContext(RewardContext);
  if (!context) {
    throw new Error('Reward components must be used within Reward component');
  }
  return context;
};

// ========== CARD COMPONENTS ==========

interface RewardCardProps {
  children: React.ReactNode;
  className?: string;
}

function RewardCard({ children, className }: RewardCardProps) {
  return <Card className={cn('overflow-hidden', className)}>{children}</Card>;
}

// ========== HEADER COMPONENTS ==========

interface RewardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function RewardHeader({ children, className }: RewardHeaderProps) {
  return <CardHeader className={className}>{children}</CardHeader>;
}

interface RewardHeaderContainerProps {
  children: React.ReactNode;
  className?: string;
}

function RewardHeaderContainer({ children, className }: RewardHeaderContainerProps) {
  return <div className={cn('flex items-start justify-between gap-4', className)}>{children}</div>;
}

interface RewardTitleContainerProps {
  children: React.ReactNode;
  className?: string;
}

function RewardTitleContainer({ children, className }: RewardTitleContainerProps) {
  return <div className={cn('space-y-1 flex-1', className)}>{children}</div>;
}

interface RewardTitleGroupProps {
  children: React.ReactNode;
  className?: string;
}

function RewardTitleGroup({ children, className }: RewardTitleGroupProps) {
  return <div className={cn('flex items-center gap-2', className)}>{children}</div>;
}

interface RewardTitleProps {
  children?: React.ReactNode;
  className?: string;
  emoji?: string;
}

function RewardTitle({ children, className, emoji = '🗳️' }: RewardTitleProps) {
  const { reward } = useRewardContext();
  return (
    <CardTitle className={cn('text-lg', className)}>
      {emoji} {children || reward.poll_title}
    </CardTitle>
  );
}

interface RewardDescriptionProps {
  children?: React.ReactNode;
  className?: string;
}

function RewardDescription({ children, className }: RewardDescriptionProps) {
  const { reward } = useRewardContext();
  return (
    <CardDescription className={className}>
      {children || `Your vote: ${reward.choice_name} ✓`}
    </CardDescription>
  );
}

interface RewardStatusBadgeProps {
  status?: 'active' | 'claimable' | 'claimed' | 'expired';
  className?: string;
}

function RewardStatusBadge({ status = 'active', className }: RewardStatusBadgeProps) {
  const statusConfig = {
    active: { label: '🔵 Active', className: 'bg-blue-500 text-white' },
    claimable: { label: '✅ Claimable', className: 'bg-green-500 text-white' },
    claimed: { label: '💰 Claimed', className: 'bg-purple-500 text-white' },
    expired: { label: '⏰ Expired', className: 'bg-gray-500 text-white' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

// ========== CONTENT COMPONENTS ==========

interface RewardContentProps {
  children: React.ReactNode;
  className?: string;
}

function RewardContent({ children, className }: RewardContentProps) {
  return <CardContent className={cn('space-y-4', className)}>{children}</CardContent>;
}

interface RewardSectionProps {
  children: React.ReactNode;
  className?: string;
}

function RewardSection({ children, className }: RewardSectionProps) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

// ========== TIME COMPONENTS ==========

interface RewardTimeRemainingProps {
  className?: string;
  label?: string;
}

function RewardTimeRemaining({ className, label = 'Claimable in:' }: RewardTimeRemainingProps) {
  const { reward } = useRewardContext();
  const claimableDate = new Date(reward.claimable_at);
  const now = Date.now();
  const timeUntilClaimable = claimableDate.getTime() - now;

  // Calculate time remaining
  const days = Math.max(0, Math.floor(timeUntilClaimable / (1000 * 60 * 60 * 24)));
  const hours = Math.max(
    0,
    Math.floor((timeUntilClaimable % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  );
  const minutes = Math.max(0, Math.floor((timeUntilClaimable % (1000 * 60 * 60)) / (1000 * 60)));

  const timeRemaining =
    days > 0
      ? `${days}d ${hours}h ${minutes}m`
      : hours > 0
        ? `${hours}h ${minutes}m`
        : `${minutes}m`;

  return (
    <div className={cn('flex items-center justify-between text-sm', className)}>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">{label}</span>
      </div>
      <span className="font-bold">{timeRemaining}</span>
    </div>
  );
}

interface RewardClaimableDateProps {
  className?: string;
  formatString?: string;
  label?: string;
}

function RewardClaimableDate({
  className,
  formatString = 'MMM dd, yyyy HH:mm',
  label = 'Claimable at:',
}: RewardClaimableDateProps) {
  const { reward } = useRewardContext();
  const claimableDate = new Date(reward.claimable_at);

  return (
    <p className={cn('text-xs text-muted-foreground', className)} suppressHydrationWarning>
      {label} <ClientDate date={claimableDate} formatString={formatString} />
    </p>
  );
}

// ========== INFO COMPONENTS ==========

interface RewardInfoGridProps {
  children: React.ReactNode;
  className?: string;
}

function RewardInfoGrid({ children, className }: RewardInfoGridProps) {
  return <div className={cn('grid gap-3 text-sm', className)}>{children}</div>;
}

interface RewardInfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  suppressHydrationWarning?: boolean;
}

function RewardInfoRow({ label, value, className, suppressHydrationWarning }: RewardInfoRowProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium" suppressHydrationWarning={suppressHydrationWarning}>
        {value}
      </span>
    </div>
  );
}

interface RewardVotedDateProps {
  className?: string;
  formatString?: string;
  label?: string;
  dateField?: 'voted_at' | 'created_at' | 'updated_at';
}

function RewardVotedDate({
  className,
  formatString = 'MMM dd, yyyy HH:mm',
  label = 'Voted At:',
  dateField = 'voted_at',
}: RewardVotedDateProps) {
  const { reward } = useRewardContext();
  const votedDate = new Date(reward[dateField] ?? '');

  return (
    <RewardInfoRow
      label={label}
      value={<ClientDate date={votedDate} formatString={formatString} />}
      className={className}
      suppressHydrationWarning
    />
  );
}

interface RewardTotalVotesProps {
  className?: string;
  label?: string;
}

function RewardTotalVotes({ className, label = 'Total Votes:' }: RewardTotalVotesProps) {
  const { reward } = useRewardContext();
  return (
    <RewardInfoRow
      label={label}
      value={reward.poll_total_votes.toLocaleString()}
      className={className}
    />
  );
}

interface RewardChoiceVotesProps {
  className?: string;
  label?: string;
}

function RewardChoiceVotes({ className, label = 'Your Choice Votes:' }: RewardChoiceVotesProps) {
  const { reward } = useRewardContext();
  return (
    <RewardInfoRow
      label={label}
      value={reward.choice_total_votes.toLocaleString()}
      className={className}
    />
  );
}

// ========== AMOUNT COMPONENTS ==========

interface RewardAmountBoxProps {
  children: React.ReactNode;
  className?: string;
}

function RewardAmountBox({ children, className }: RewardAmountBoxProps) {
  return <div className={cn('rounded-lg bg-muted p-4 space-y-1', className)}>{children}</div>;
}

interface RewardAmountRowProps {
  children: React.ReactNode;
  className?: string;
}

function RewardAmountRow({ children, className }: RewardAmountRowProps) {
  return <div className={cn('flex items-center justify-between', className)}>{children}</div>;
}

interface RewardAmountLabelProps {
  children?: React.ReactNode;
  emoji?: string;
  className?: string;
}

function RewardAmountLabel({
  children = 'Potential Reward:',
  emoji = '💎',
  className,
}: RewardAmountLabelProps) {
  return (
    <span className={cn('text-sm text-muted-foreground', className)}>
      {emoji} {children}
    </span>
  );
}

interface RewardAmountValueProps {
  children: React.ReactNode;
  className?: string;
}

function RewardAmountValue({ children, className }: RewardAmountValueProps) {
  return <div className={cn('text-right', className)}>{children}</div>;
}

interface RewardPrincipalProps {
  className?: string;
  label?: string;
}

function RewardPrincipal({ className, label = 'Principal:' }: RewardPrincipalProps) {
  const { reward } = useRewardContext();
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {label} {reward.principal_amount} AGR
    </p>
  );
}

// ========== ALERT COMPONENTS ==========

interface RewardAlertProps {
  children: React.ReactNode;
  variant?: 'warning' | 'info' | 'success' | 'error';
  className?: string;
}

function RewardAlert({ children, variant = 'warning', className }: RewardAlertProps) {
  const variantStyles = {
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
    success: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300',
    error: 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300',
  };

  return (
    <div className={cn('rounded-lg border p-3 text-sm', variantStyles[variant], className)}>
      {children}
    </div>
  );
}

// ========== ACTION COMPONENTS ==========

interface RewardActionsProps {
  children: React.ReactNode;
  className?: string;
}

function RewardActions({ children, className }: RewardActionsProps) {
  return <div className={cn('flex flex-wrap gap-2', className)}>{children}</div>;
}

// ========== COMPOUND COMPONENT EXPORT ==========

export const Reward = Object.assign(RewardRoot, {
  // Card
  Card: RewardCard,

  // Header
  Header: RewardHeader,
  HeaderContainer: RewardHeaderContainer,
  TitleContainer: RewardTitleContainer,
  TitleGroup: RewardTitleGroup,
  Title: RewardTitle,
  Description: RewardDescription,
  StatusBadge: RewardStatusBadge,

  // Content
  Content: RewardContent,
  Section: RewardSection,

  // Time
  TimeRemaining: RewardTimeRemaining,
  ClaimableDate: RewardClaimableDate,

  // Info
  InfoGrid: RewardInfoGrid,
  InfoRow: RewardInfoRow,
  VotedDate: RewardVotedDate,
  TotalVotes: RewardTotalVotes,
  ChoiceVotes: RewardChoiceVotes,

  // Amount
  AmountBox: RewardAmountBox,
  AmountRow: RewardAmountRow,
  AmountLabel: RewardAmountLabel,
  AmountValue: RewardAmountValue,
  Principal: RewardPrincipal,

  // Alert
  Alert: RewardAlert,

  // Actions
  Actions: RewardActions,
});

// Export legacy components for backward compatibility
export const RewardProvider = RewardRoot;
export { RewardTimeRemaining, RewardClaimableDate };
