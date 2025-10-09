/**
 * SubmitButton Component
 *
 * A reusable submit button component that automatically handles form submission state.
 * This component is pre-bound to work with the custom form hook.
 */
import { Button } from '~/components/ui/button';
import { Spinner } from '~/components/ui/spinner';

import { useFormContext } from '../form-context';

interface SubmitButtonProps extends React.ComponentProps<'button'> {
  label?: string;
  loadingLabel?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SubmitButton({
  label = 'Submit',
  loadingLabel = 'Submitting...',
  disabled = false,
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          type="submit"
          disabled={disabled || isSubmitting || !canSubmit}
          className={className}
          variant={variant}
          size={size}
          {...props}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Spinner className="w-4 h-4" />
              {loadingLabel}
            </div>
          ) : (
            children || label
          )}
        </Button>
      )}
    </form.Subscribe>
  );
}
