'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 bg-obsidian">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="p-6 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="text-red-500" size={64} />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-text-primary font-orbitron">
              An Error Occurred
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-8 font-rajdhani max-w-md mx-auto">
              Something went wrong. Please try again later.
            </p>
            <button
              onClick={reset}
              className="px-6 md:px-8 py-3 md:py-4 bg-ice text-obsidian font-bold uppercase tracking-widest hover:bg-ice/80 transition-colors rounded-lg font-orbitron text-sm md:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
