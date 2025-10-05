import { Loader2Icon } from 'lucide-react';
import { cn } from '~/lib/utils';

import * as React from 'react';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted';
  type?: 'spinner' | 'ellipsis';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const variantClasses = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
};

interface EllipsisSpinnerProps extends SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted';
}

const EllipsisSpinner = ({ size = 'md', ...props }: EllipsisSpinnerProps) => {
  return (
    <svg
      height={sizeClasses[size]}
      viewBox="0 0 24 24"
      width={sizeClasses[size]}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Loading...</title>
      <circle cx="4" cy="12" fill="currentColor" r="2">
        <animate
          attributeName="cy"
          begin="0;ellipsis3.end+0.25s"
          calcMode="spline"
          dur="0.6s"
          id="ellipsis1"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
          values="12;6;12"
        />
      </circle>
      <circle cx="12" cy="12" fill="currentColor" r="2">
        <animate
          attributeName="cy"
          begin="ellipsis1.begin+0.1s"
          calcMode="spline"
          dur="0.6s"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
          values="12;6;12"
        />
      </circle>
      <circle cx="20" cy="12" fill="currentColor" r="2">
        <animate
          attributeName="cy"
          begin="ellipsis1.begin+0.2s"
          calcMode="spline"
          dur="0.6s"
          id="ellipsis3"
          keySplines=".33,.66,.66,1;.33,0,.66,.33"
          values="12;6;12"
        />
      </circle>
    </svg>
  );
};

function Spinner({ className, size = 'md', variant = 'default', type = 'spinner' }: SpinnerProps) {
  switch (type) {
    case 'spinner':
      return (
        <Loader2Icon
          className={cn('animate-spin', sizeClasses[size], variantClasses[variant], className)}
        />
      );
    case 'ellipsis':
      return <EllipsisSpinner size={size} variant={variant} className={className} />;
  }
}

export { Spinner, EllipsisSpinner };
