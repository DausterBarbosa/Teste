import { useState } from 'react';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { Product } from '../types/menu';
import { formatBRL } from '../utils/format';

interface ProductCardProps {
  product: Product;
  categoryName: string;
  onSelect: (product: Product) => void;
}

export function ProductCard({
  product,
  categoryName,
  onSelect,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const hasSizes = Boolean(product.sizes && product.sizes.length > 0);
  const startingPrice = hasSizes
    ? Math.min(...product.sizes!.map((s) => s.price))
    : product.price;

  return (
    <article
      onClick={() => onSelect(product)}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(17,24,39,0.08)] cursor-pointer dark:bg-[#1A1817] dark:border dark:border-zinc-800 dark:shadow-none dark:hover:border-zinc-700"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-red-50 to-amber-50 p-4 text-center dark:from-zinc-900 dark:to-zinc-800">
            <UtensilsCrossed className="h-8 w-8 text-[#B82925] dark:text-[#F0645E]" aria-hidden="true" />
            <span className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {product.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span>{categoryName}</span>
            {product.featured && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#B82925] dark:text-[#F0645E]">
                  Mais pedida
                </span>
              </>
            )}
            {product.allowHalfAndHalf && (
              <>
                <span aria-hidden="true">·</span>
                <span>Meio a meio</span>
              </>
            )}
          </div>

          <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
            {product.name}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {product.description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <div>
            {hasSizes && (
              <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                A partir de
              </span>
            )}
            <span className="font-display text-lg font-bold text-zinc-900 tabular-nums dark:text-zinc-50">
              {formatBRL(startingPrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#B82925]/10 px-4 py-2 text-sm font-semibold text-[#B82925] transition-colors hover:bg-[#B82925] hover:text-white active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer dark:bg-[#F0645E]/15 dark:text-[#F0645E] dark:hover:bg-[#B82925] dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B82925]"
            aria-label={`Personalizar e adicionar ${product.name}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{hasSizes ? 'Montar' : 'Adicionar'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
