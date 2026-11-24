import { useState } from 'react';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { Product } from '../types/menu';
import { formatBRL } from '../utils/format';

interface CombosSectionProps {
  combos: Product[];
  onSelectCombo: (product: Product) => void;
}

export function CombosSection({ combos, onSelectCombo }: CombosSectionProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (combos.length === 0) return null;

  return (
    <section
      id="combos"
      aria-labelledby="combos-heading"
      className="mx-auto mt-12 max-w-7xl scroll-mt-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="border-t border-zinc-200/80 pt-10 dark:border-zinc-800">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="combos-heading"
            className="font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Combos da Serra
          </h2>
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            Combinações completas com pizzas no forno a lenha, entradas e bebidas.
          </p>
        </div>

        <span className="text-xs font-medium text-[#2D5A3C] tabular-nums dark:text-[#6DBA87]">
          {combos.length} opções especiais
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-7">
        {combos.map((combo) => {
          const hasImgError = Boolean(failedImages[combo.id]);

          return (
            <article
              key={combo.id}
              onClick={() => onSelectCombo(combo)}
              className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(17,24,39,0.08)] cursor-pointer dark:bg-[#1A1817] dark:border dark:border-zinc-800 dark:shadow-none dark:hover:border-zinc-700"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {!hasImgError ? (
                  <img
                    src={combo.image}
                    alt={combo.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [combo.id]: true }))
                    }
                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-red-50 to-amber-50 p-4 text-center dark:from-zinc-900 dark:to-zinc-800">
                    <UtensilsCrossed
                      className="h-8 w-8 text-[#B82925] dark:text-[#F0645E]"
                      aria-hidden="true"
                    />
                    <span className="mt-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      {combo.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <span>Combo</span>
                    {combo.featured && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#B82925] dark:text-[#F0645E]">
                          Mais pedido
                        </span>
                      </>
                    )}
                    {combo.comboFlavors && combo.comboFlavors.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Sabor à escolha</span>
                      </>
                    )}
                  </div>

                  <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                    {combo.name}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {combo.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <span className="font-display text-lg font-bold text-zinc-900 tabular-nums dark:text-zinc-50">
                    {formatBRL(combo.price)}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCombo(combo);
                    }}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#B82925] px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#9B201D] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B82925]"
                    aria-label={`Montar ${combo.name}`}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    <span>Montar combo</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        </div>
      </div>
    </section>
  );
}
