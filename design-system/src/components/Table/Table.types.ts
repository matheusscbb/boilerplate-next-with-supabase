import type {
  HTMLAttributes,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
} from 'react';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}
