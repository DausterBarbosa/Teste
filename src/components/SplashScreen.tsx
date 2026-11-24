import { useEffect, useState } from 'react';

interface SplashScreenProps {
  storeName: string;
  logo?: string;
  onFinish: () => void;
}

export function SplashScreen({ storeName, logo, onFinish }: SplashScreenProps) {
  const [isFading, setIsFading] = useState(false);
  const [progressActive, setProgressActive] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const rafId = requestAnimationFrame(() => {
      setProgressActive(true);
    });

    const fadeTimer = window.setTimeout(() => {
      setIsFading(true);
    }, 2750);

    const finishTimer = window.setTimeout(() => {
      document.body.style.overflow = previousOverflow;
      onFinish();
    }, 3000);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(finishTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onFinish]);

  return (
    <div
      role="status"
      aria-label={`Carregando ${storeName}`}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F7F6F3] px-6 text-zinc-900 transition-opacity duration-250 ease-out dark:bg-[#111010] dark:text-zinc-50 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div
        className={`flex flex-col items-center text-center transition-transform duration-300 ease-out ${
          isFading ? 'scale-95' : 'scale-100'
        }`}
      >
        <div className="flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56">
          {logo && !imgError ? (
            <img
              src={logo}
              alt={`Logo ${storeName}`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-contain drop-shadow-[0_12px_28px_rgba(184,41,37,0.18)] dark:drop-shadow-[0_12px_28px_rgba(229,77,71,0.22)]"
            />
          ) : (
            <svg
              viewBox="0 0 64 64"
              className="h-20 w-20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="32" cy="32" r="25" stroke="#B82925" strokeWidth="3" />
              <path
                d="M32 32L51.5 16.5C54.9 20.8 57 26.1 57 32H32Z"
                fill="#E88B28"
                fillOpacity="0.92"
              />
            </svg>
          )}
        </div>

        <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          {storeName}
        </h1>

        <p className="mt-1.5 text-sm font-medium text-[#2D5A3C] dark:text-[#6DBA87]">
          Pizzaria Artesanal · Est. 2026
        </p>

        <div
          aria-hidden="true"
          className="mt-7 h-1 w-44 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
        >
          <div
            className="h-full w-full origin-left rounded-full bg-[#B82925] transition-transform duration-[2750ms] ease-linear dark:bg-[#E54D47]"
            style={{
              transform: progressActive ? 'scaleX(1)' : 'scaleX(0)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
