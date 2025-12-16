import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

interface StatCardProps {
  title: string;
  value?: string | number;
  children?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  children, 
  className,
  valueClassName 
}: StatCardProps) => {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardContent className="p-3 md:p-4 lg:p-5 text-center">
        <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2 uppercase leading-tight">
          {title}
        </p>
        {value !== undefined && (
          <p className={cn("text-2xl md:text-3xl lg:text-4xl font-bold", valueClassName)}>
            {value}
          </p>
        )}
        {children}
      </CardContent>
    </Card>
  );
};