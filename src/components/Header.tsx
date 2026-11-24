import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { Category } from '../types/menu';
import { formatBRL } from '../utils/format';

interface HeaderProps {
  storeName: string;
  logo?: string;
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
}

export function Header({
  storeName,
  logo,
  categories,
  activeCategory,
  onSelectCategory,
  cartCount,
  cartSubtotal,
  onOpenCart,
}: HeaderProps) {
  const [logoError, setLogoError] = useState(false);
  const navCategories = categories.filter((c) => c.id !== 'todos').slice(0, 5);

  const handleNavClick = (categoryId: string) => {
    onSelectCategory(categoryId);
    const menuEl = document.getElementById('cardapio');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-[#F7F6F3]/90 backdrop-blur-md dark:border-zinc-800/90 dark:bg-[#111010]/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <a
          href="#topo"
          className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 dark:text-zinc-50"
        >
          {logo && !logoError && (
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              onError={() => setLogoError(true)}
              className="h-9 w-9 rounded-lg bg-white object-contain p-0.5 ring-1 ring-zinc-200/80 dark:ring-zinc-700"
            />
          )}
          <span>{storeName}</span>
        </a>

        <nav
          aria-label="Categorias do cardápio"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          {navCategories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleNavClick(category.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B82925] ${
                  isActive
                    ? 'text-[#B82925] font-semibold dark:text-[#F0645E]'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onOpenCart}
          className="inline-flex min-h-[44px] items-center gap-2.5 rounded-xl bg-[#B82925] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9B201D] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B82925]"
          aria-label={`Abrir sacola com ${cartCount} itens`}
        >
          <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Sacola</span>
          {cartCount > 0 && (
            <span className="tabular-nums border-l border-white/30 pl-2.5 text-xs font-bold">
              {cartCount} · {formatBRL(cartSubtotal)}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
