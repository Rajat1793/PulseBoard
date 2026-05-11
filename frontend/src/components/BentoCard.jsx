import { cn } from '../lib/utils';

export default function BentoCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bento-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
