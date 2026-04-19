import type { ListProps, ListItemProps } from './List.types';

const variantStyles = {
  unordered: 'list-disc list-inside',
  ordered: 'list-decimal list-inside',
  none: 'list-none',
};

function ListRoot({ variant = 'unordered', children, className = '', ...props }: ListProps) {
  const classes = [
    'space-y-1 text-foreground',
    variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (variant === 'ordered') {
    return <ol className={classes}>{children}</ol>;
  }

  return (
    <ul className={classes} {...props}>
      {children}
    </ul>
  );
}

function Item({ children, className = '', ...props }: ListItemProps) {
  return (
    <li
      className={['text-foreground', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </li>
  );
}

export const List = Object.assign(ListRoot, { Item });
