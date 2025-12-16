import { AlertTriangle } from 'lucide-react';
export function ConnectionErrorBanner() {
  return (
    <div className="w-full p-4 bg-white/10 backdrop-blur-md border border-destructive/20 rounded-lg focus:border-destructive transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="shrink-0 mt-0.5">
            <div className="p-1 rounded-full bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive leading-relaxed">
              Connection error. Please try again later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

