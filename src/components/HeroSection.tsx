import { useState } from 'react';
import { Clock, MapPin, Moon, Sun, Truck, UtensilsCrossed } from 'lucide-react';
import { StoreInfo } from '../types/menu';
import { formatBRL } from '../utils/format';

interface HeroSectionProps {
  store: StoreInfo;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function HeroSection({
  store,
  isDark,
  onToggleTheme,
}: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <section
      id="topo"
      className="mx-auto max-w-7xl px-4 pt-4 pb-6 sm:px-6 sm:pt-6 lg:px-8"
    >
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] dark:bg-[#1A1817] dark:border dark:border-zinc-800 dark:shadow-none">
        <div className="relative h-44 w-full overflow-hidden bg-zinc-200 sm:h-52 lg:h-60 dark:bg-zinc-800">
          {!imgError ? (
            <img
              src={store.heroImage}
              alt={`Pizza artesanal assada no forno a lenha da ${store.name}`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-50 to-amber-50 dark:from-zinc-900 dark:to-zinc-800">
              <UtensilsCrossed className="h-10 w-10 text-[#B82925]" aria-hidden="true" />
            </div>
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15"
          />

          <div className="absolute right-3 top-3 sm:right-5 sm:top-4">
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white/90 px-3.5 py-2 text-xs font-semibold text-zinc-900 shadow-sm backdrop-blur-md transition-colors hover:bg-white whitespace-nowrap shrink-0 cursor-pointer dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B82925]"
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo noturno'}
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 text-[#F5B731]" aria-hidden="true" />
                  <span>Modo claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-zinc-700" aria-hidden="true" />
                  <span>Modo noturno</span>
                </>
              )}
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end gap-3.5 p-4 sm:gap-4 sm:px-6 sm:py-5">
            {store.logo && !logoError && (
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white p-1 shadow-md ring-1 ring-white/40 sm:h-16 sm:w-16">
                <img
                  src={store.logo}
                  alt={`Logo ${store.name}`}
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-xs font-medium text-[#F5B731] truncate">
                Pizzaria Artesanal · Fermentação Natural 48h · Forno a Lenha
              </p>
              <h1 className="mt-0.5 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl text-balance">
                {store.name}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock className="h-4 w-4 text-[#B82925] dark:text-[#F0645E] shrink-0" aria-hidden="true" />
              <span className="tabular-nums">Entrega em {store.deliveryTime}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 font-medium">
              <Truck className="h-4 w-4 text-[#E88B28] shrink-0" aria-hidden="true" />
              <span className="tabular-nums">Taxa de entrega {formatBRL(store.deliveryFee)}</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#2D5A3C] dark:text-[#6DBA87] shrink-0" aria-hidden="true" />
              <span>{store.pickupAddress}</span>
            </span>
          </div>

          <p className="text-xs font-medium text-[#2D5A3C] dark:text-[#6DBA87]">
            {store.openingHours} · Retirada grátis no balcão
          </p>
        </div>
      </div>
    </section>
  );
}
