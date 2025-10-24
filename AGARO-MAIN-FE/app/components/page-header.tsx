import { cn } from '~/lib/utils';

interface PageHeaderProps extends React.ComponentProps<'div'> {}
interface PageHeaderTitleProps extends React.ComponentProps<'h1'> {}
interface PageHeaderDescriptionProps extends React.ComponentProps<'p'> {}
interface PageHeaderContent extends React.ComponentProps<'div'> {}

const PageHeader = ({ children, className, ...props }: PageHeaderProps) => {
  return (
    <div className={cn('flex items-start justify-between', className)} {...props}>
      {children}
    </div>
  );
};

const PageHeaderContent = ({ children, className, ...props }: PageHeaderContent) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  );
};

const PageHeaderTitle = ({ children, className }: PageHeaderTitleProps) => {
  return <h1 className={cn('text-3xl font-bold tracking-tight', className)}>{children}</h1>;
};

const PageHeaderDescription = ({ children, className }: PageHeaderDescriptionProps) => {
  return <p className={cn('text-muted-foreground', className)}>{children}</p>;
};

export const Page = {
  Header: PageHeader,
  Content: PageHeaderContent,
  Title: PageHeaderTitle,
  Description: PageHeaderDescription,
};
