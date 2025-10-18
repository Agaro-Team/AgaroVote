/**
 * Client Date Component
 *
 * Renders dates on client-side only to prevent SSR hydration mismatches.
 * Uses suppressHydrationWarning for safe date rendering.
 */
import { format } from 'date-fns';

import { useEffect, useState } from 'react';

interface ClientDateProps {
  date: Date;
  formatString?: string;
  className?: string;
}

export function ClientDate({
  date,
  formatString = 'MMM dd, yyyy HH:mm',
  className,
}: ClientDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder during SSR to prevent hydration mismatch
    return (
      <span className={className} suppressHydrationWarning>
        Loading...
      </span>
    );
  }

  return (
    <span className={className} suppressHydrationWarning>
      {format(date, formatString)}
    </span>
  );
}

interface ClientRelativeDateProps {
  date: Date;
  className?: string;
}

export function ClientRelativeDate({ date, className }: ClientRelativeDateProps) {
  const [mounted, setMounted] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    setMounted(true);
    updateTimeAgo();

    // Update every minute
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [date]);

  const updateTimeAgo = () => {
    const now = Date.now();
    const diff = now - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
      setTimeAgo(`${days}d ago`);
    } else if (hours > 0) {
      setTimeAgo(`${hours}h ago`);
    } else if (minutes > 0) {
      setTimeAgo(`${minutes}m ago`);
    } else {
      setTimeAgo('just now');
    }
  };

  if (!mounted) {
    return (
      <span className={className} suppressHydrationWarning>
        ...
      </span>
    );
  }

  return (
    <span className={className} suppressHydrationWarning>
      {timeAgo}
    </span>
  );
}
