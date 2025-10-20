/**
 * Dashboard Error Component
 *
 * Displays inline error message when dashboard data fails to load
 */
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';

interface DashboardErrorProps {
  error: Error;
  onRetry?: () => void;
}

export function DashboardError({ error, onRetry }: DashboardErrorProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Failed to load dashboard data</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{error.message || 'An unexpected error occurred'}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-4 shrink-0">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
