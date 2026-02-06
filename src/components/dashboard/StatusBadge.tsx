import { cn } from '@/lib/utils';

type StatusType = 'online' | 'offline' | 'blocked' | 'suspicious' | 'active' | 'inactive' | 'maintenance';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  online: 'bg-success/20 text-success',
  active: 'bg-success/20 text-success',
  offline: 'bg-muted text-muted-foreground',
  inactive: 'bg-muted text-muted-foreground',
  blocked: 'bg-destructive/20 text-destructive',
  suspicious: 'bg-warning/20 text-warning',
  maintenance: 'bg-info/20 text-info',
};

const statusDot: Record<StatusType, string> = {
  online: 'bg-success',
  active: 'bg-success',
  offline: 'bg-muted-foreground',
  inactive: 'bg-muted-foreground',
  blocked: 'bg-destructive',
  suspicious: 'bg-warning',
  maintenance: 'bg-info',
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn("badge-status", statusStyles[status], className)}>
      <span className={cn("w-2 h-2 rounded-full", statusDot[status])} />
      <span className="capitalize">{status}</span>
    </span>
  );
}
