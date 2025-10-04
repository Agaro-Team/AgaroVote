import { toast } from 'sonner';
import { Button } from '~/components/ui/button';

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast('Event has been created', {
            description: 'Sunday, December 03, 2023 at 9:00 AM',
          })
        }
      >
        Show Toast
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast.success('Success!', {
            description: 'Your action was completed successfully.',
          })
        }
      >
        Success Toast
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast.error('Error!', {
            description: 'Something went wrong. Please try again.',
          })
        }
      >
        Error Toast
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast.info('Info', {
            description: 'This is an informational message.',
          })
        }
      >
        Info Toast
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast.warning('Warning!', {
            description: 'Please be careful with this action.',
          })
        }
      >
        Warning Toast
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          toast('Event has been created', {
            description: 'Sunday, December 03, 2023 at 9:00 AM',
            action: {
              label: 'Undo',
              onClick: () => console.log('Undo clicked'),
            },
          })
        }
      >
        Toast with Action
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          const promise = new Promise((resolve) => setTimeout(resolve, 2000));

          toast.promise(promise, {
            loading: 'Loading...',
            success: 'Data loaded successfully!',
            error: 'Failed to load data',
          });
        }}
      >
        Promise Toast
      </Button>
    </div>
  );
}
