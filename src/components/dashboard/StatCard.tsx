import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  accentColor?: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
}

const accentColors = {
  primary: 'from-primary to-info',
  success: 'from-success to-emerald-400',
  warning: 'from-warning to-amber-400',
  destructive: 'from-destructive to-rose-400',
  info: 'from-info to-cyan-400',
};

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  accentColor = 'primary' 
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card group"
    >
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
        accentColors[accentColor]
      )} />
      
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
          accentColors[accentColor]
        )}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-sm font-medium px-2 py-1 rounded-full",
            trend.positive 
              ? "bg-success/20 text-success" 
              : "bg-destructive/20 text-destructive"
          )}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>

      <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </motion.div>
  );
}
