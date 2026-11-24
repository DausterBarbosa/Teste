import { StoreInfo } from '../types/menu';
import { formatBRL } from '../utils/format';

interface FooterProps {
  store: StoreInfo;
}

export function Footer({ store }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-zinc-200/80 bg-white py-10 pb-24 md:pb-10 dark:border-zinc-800 dark:bg-[#1A1817]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {store.name}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {store.pickupAddress} · {store.openingHours}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="tabular-nums">Tempo médio: {store.deliveryTime}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">Entrega: {formatBRL(store.deliveryFee)}</span>
          <span aria-hidden="true">·</span>
          <span>© {new Date().getFullYear()} {store.name}</span>
        </div>
      </div>
    </footer>
  );
}
