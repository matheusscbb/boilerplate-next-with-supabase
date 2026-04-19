import type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps } from './Card.types';

function CardRoot({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={[
        'rounded-lg border border-border bg-background p-4 shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={['mb-4 text-lg font-semibold', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className || undefined}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={['mt-4 flex justify-end gap-2', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
});
