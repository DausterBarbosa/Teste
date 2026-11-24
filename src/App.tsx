import { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchX } from 'lucide-react';
import menuJson from './data/menu.json';
import { Addon, CartItem, MenuData, PizzaSizeOption, Product } from './types/menu';
import { getCartItemTotal } from './utils/format';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { MenuToolbar } from './components/MenuToolbar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { MobileCartBar } from './components/MobileCartBar';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';
import { CombosSection } from './components/CombosSection';

const menuData = menuJson as MenuData;

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pizza-craft-theme');
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalHalfAndHalf, setModalHalfAndHalf] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pizza-craft-cart');
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('pizza-craft-theme', isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage failures
    }
  }, [isDark]);

  useEffect(() => {
    try {
      localStorage.setItem('pizza-craft-cart', JSON.stringify(cart));
    } catch {
      // Ignore storage failures
    }
  }, [cart]);

  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    menuData.categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, []);

  const comboProducts = useMemo(
    () => menuData.products.filter((product) => product.categoryId === 'combos'),
    []
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return menuData.products.filter((product) => {
      if (activeCategory === 'todos' && !normalizedQuery && product.categoryId === 'combos') {
        return false;
      }

      const matchesCategory =
        activeCategory === 'todos' || product.categoryId === activeCategory;
      if (!matchesCategory) return false;

      if (!normalizedQuery) return true;
      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [activeCategory, searchQuery]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + getCartItemTotal(item), 0),
    [cart]
  );

  const handleOpenProduct = (product: Product, startHalfAndHalf = false) => {
    setModalHalfAndHalf(startHalfAndHalf);
    setSelectedProduct(product);
  };

  const handleOpenHalfAndHalfBuilder = () => {
    const firstPizza = menuData.products.find((p) => p.allowHalfAndHalf);
    if (firstPizza) {
      handleOpenProduct(firstPizza, true);
    }
  };

  const handleAddToCart = (payload: {
    product: Product;
    selectedSize: PizzaSizeOption | null;
    secondHalfProduct: Product | null;
    selectedComboFlavor: string | null;
    selectedAddons: Addon[];
    quantity: number;
    notes: string;
  }) => {
    const sizeKey = payload.selectedSize?.id ?? 'padrao';
    const secondKey = payload.secondHalfProduct?.id ?? 'inteira';
    const comboKey = payload.selectedComboFlavor ?? 'sem-combo';
    const addonKey = payload.selectedAddons
      .map((a) => a.id)
      .sort()
      .join(',');
    const normalizedNotes = payload.notes.trim();
    const signature = `${payload.product.id}__${sizeKey}__${secondKey}__${comboKey}__${addonKey}__${normalizedNotes}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === signature);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + payload.quantity,
        };
        return updated;
      }

      return [
        ...prev,
        {
          cartItemId: signature,
          product: payload.product,
          selectedSize: payload.selectedSize,
          secondHalfProduct: payload.secondHalfProduct,
          selectedComboFlavor: payload.selectedComboFlavor,
          selectedAddons: payload.selectedAddons,
          quantity: payload.quantity,
          notes: normalizedNotes,
        },
      ];
    });
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-zinc-900 transition-colors duration-200 dark:bg-[#111010] dark:text-zinc-100">
      {showSplash && (
        <SplashScreen
          storeName={menuData.store.name}
          logo={menuData.store.logo}
          onFinish={handleSplashFinish}
        />
      )}
      <Header
        storeName={menuData.store.name}
        logo={menuData.store.logo}
        categories={menuData.categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main>
        <HeroSection
          store={menuData.store}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
        />

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MenuToolbar
            categories={menuData.categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultCount={filteredProducts.length}
            onOpenHalfAndHalf={handleOpenHalfAndHalfBuilder}
          />

          {filteredProducts.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoryNameMap[product.categoryId] || 'Cardápio'}
                  onSelect={(p) => handleOpenProduct(p, false)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white px-6 py-14 text-center dark:border-zinc-800 dark:bg-[#1A1817]">
              <SearchX className="h-10 w-10 text-zinc-400" aria-hidden="true" />
              <h3 className="mt-3 font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Nenhum item encontrado
              </h3>
              <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                Não encontramos produtos para "{searchQuery}" nesta categoria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('todos');
                }}
                className="mt-5 min-h-[44px] rounded-xl bg-[#B82925] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9B201D] cursor-pointer"
              >
                Ver todos os itens
              </button>
            </div>
          )}
        </section>

        {activeCategory === 'todos' && !searchQuery.trim() && (
          <CombosSection
            combos={comboProducts}
            onSelectCombo={(p) => handleOpenProduct(p, false)}
          />
        )}
      </main>

      <Footer store={menuData.store} />

      <MobileCartBar
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <ProductModal
        product={selectedProduct}
        allProducts={menuData.products}
        initialHalfAndHalf={modalHalfAndHalf}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        store={menuData.store}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
