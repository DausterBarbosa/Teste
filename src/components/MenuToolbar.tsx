import { Pizza, Search, X } from 'lucide-react';
import { Category } from '../types/menu';

interface MenuToolbarProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount: number;
  onOpenHalfAndHalf: () => void;
}

export function MenuToolbar({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  resultCount,
  onOpenHalfAndHalf,
}: MenuToolbarProps) {
  return (
    <div id="cardapio" className="scroll-mt-20 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Cardápio
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500 tabular-nums dark:text-zinc-400">
            {resultCount === 1
              ? '1 item disponível'
              : `${resultCount} itens disponíveis`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onOpenHalfAndHalf}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#B82925]/35 bg-[#B82925]/10 px-4 py-2 text-sm font-semibold text-[#B82925] transition-colors hover:bg-[#B82925] hover:text-white whitespace-nowrap shrink-0 cursor-pointer dark:border-[#F0645E]/35 dark:bg-[#F0645E]/15 dark:text-[#F0645E] dark:hover:bg-[#B82925] dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B82925]"
          >
            <Pizza className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Montar pizza meio a meio</span>
          </button>

          <div className="relative w-full sm:w-64 md:w-72">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar pizza, entrada, bebida..."
              aria-label="Buscar produtos no cardápio"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-xs transition-colors focus:border-[#B82925] focus:outline-none dark:border-zinc-800 dark:bg-[#1A1817] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#F0645E]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Limpar busca"
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:text-zinc-700 cursor-pointer dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filtrar por categoria"
        className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectCategory(category.id)}
              className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B82925] ${
                isActive
                  ? 'bg-[#B82925] text-white shadow-xs'
                  : 'bg-white text-zinc-700 border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-[#1A1817] dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800/80'
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
