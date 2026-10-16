import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className="w-full overflow-x-auto border border-[#223128] bg-[#121916] rounded-xs shadow-xs">
    <table className={`w-full text-left text-sm border-collapse ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const Thead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <thead className={`bg-[#0E1512] border-b border-[#223128] text-[11px] font-semibold uppercase tracking-wider text-[#9AA69C] ${className}`} {...props}>
    {children}
  </thead>
);

export const Tbody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <tbody className={`divide-y divide-[#19251E] bg-[#121916] ${className}`} {...props}>
    {children}
  </tbody>
);

export const Tr: React.FC<React.HTMLAttributes<HTMLTableRowElement> & { isSelected?: boolean }> = ({
  children,
  className = '',
  isSelected = false,
  ...props
}) => (
  <tr
    className={`transition-colors hover:bg-[#18231D] ${
      isSelected ? 'bg-[#1C2B23] font-medium' : ''
    } ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <th className={`px-4 py-3 text-[11px] font-semibold text-[#9AA69C] ${className}`} {...props}>
    {children}
  </th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <td className={`px-4 py-3.5 text-sm text-[#F2F0E8] ${className}`} {...props}>
    {children}
  </td>
);
