import { ShoppingBag } from 'lucide-react';
import { formatBRL } from '../utils/format';

interface MobileCartBarProps {
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
}

export function MobileCartBar({
  cartCount,
  cartSubtotal,
  onOpenCart,
}: MobileCartBarProps) {
  if (cartCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200/80 bg-white/95 px-4 py-2.5 backdrop-blur-md md:hidden dark:border-zinc-800 dark:bg-[#1A1817]/95">
      <button
        type="button"
        onClick={onOpenCart}
        className="flex min-h-[48px] w-full items-center justify-between rounded-xl bg-[#B82925] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#9B201D] active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="tabular-nums">
            {cartCount === 1 ? '1 item na sacola' : `${cartCount} itens na sacola`}
          </span>
        </div>

        <span className="font-display text-base font-bold tabular-nums">
          {formatBRL(cartSubtotal)}
        </span>
      </button>
    </div>
  );
}
