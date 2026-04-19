import type {
  TableProps,
  TableHeadProps,
  TableBodyProps,
  TableRowProps,
  TableHeaderProps,
  TableCellProps,
} from './Table.types';

function TableRoot({ children, className = '', ...props }: TableProps) {
  return (
    <div className="w-full overflow-auto rounded-lg border border-border">
      <table
        className={[
          'w-full border-collapse text-sm text-foreground',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

function Head({ children, className = '', ...props }: TableHeadProps) {
  return (
    <thead
      className={['bg-muted', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </thead>
  );
}

function Body({ children, className = '', ...props }: TableBodyProps) {
  return (
    <tbody
      className={['divide-y divide-border', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </tbody>
  );
}

function Row({ children, className = '', ...props }: TableRowProps) {
  return (
    <tr
      className={[
        'transition-colors hover:bg-muted/50',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </tr>
  );
}

function Header({ children, className = '', ...props }: TableHeaderProps) {
  return (
    <th
      className={[
        'px-4 py-3 text-left font-medium text-muted-foreground',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </th>
  );
}

function Cell({ children, className = '', ...props }: TableCellProps) {
  return (
    <td
      className={['px-4 py-3', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </td>
  );
}

export const Table = Object.assign(TableRoot, { Head, Body, Row, Header, Cell });
