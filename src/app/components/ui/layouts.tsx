import { ReactNode } from 'react';

interface StatDisplayProps {
  label: string;
  value: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function StatDisplay({ label, value, className = '', children }: StatDisplayProps) {
  return (
    <div className={`border-4 border-black p-4 bg-white flex flex-col items-center justify-center ${className}`}>
      <div className="text-xs uppercase tracking-wider mb-1 text-gray-600">{label}</div>
      <div className="text-3xl font-black">{value}</div>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  className?: string;
  children: ReactNode;
}

export function StatCard({ label, className = '', children }: StatCardProps) {
  return (
    <div className={`border-2 border-black p-2 bg-white ${className}`}>
      <div className="text-xs uppercase tracking-wider text-gray-600 mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

interface InfoPanelProps {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function InfoPanel({ title, icon, actions, className = '', children }: InfoPanelProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-xl font-black uppercase">{title}</h2>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

interface GridLayoutProps {
  columns?: number;
  gap?: number;
  className?: string;
  children: ReactNode;
}

export function GridLayout({ columns = 2, gap = 2, className = '', children }: GridLayoutProps) {
  const gridClass = `grid grid-cols-${columns} gap-${gap}`;
  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  );
}