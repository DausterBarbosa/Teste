import { useEffect, useMemo, useState } from 'react';
import { Check, Minus, Pizza, Plus, UtensilsCrossed, X } from 'lucide-react';
import { Addon, PizzaSizeOption, Product } from '../types/menu';
import { formatBRL, getPizzaBasePrice } from '../utils/format';

interface ProductModalProps {
  product: Product | null;
  allProducts: Product[];
  initialHalfAndHalf?: boolean;
  onClose: () => void;
  onAddToCart: (payload: {
    product: Product;
    selectedSize: PizzaSizeOption | null;
    secondHalfProduct: Product | null;
    selectedComboFlavor: string | null;
    selectedAddons: Addon[];
    quantity: number;
    notes: string;
  }) => void;
}

export function ProductModal({
  product,
  allProducts,
  initialHalfAndHalf = false,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  const [firstProductId, setFirstProductId] = useState<string>('');
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [isHalfAndHalf, setIsHalfAndHalf] = useState<boolean>(false);
  const [secondHalfId, setSecondHalfId] = useState<string>('');
  const [selectedComboFlavor, setSelectedComboFlavor] = useState<string>('');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [halfError, setHalfError] = useState<string>('');
  const [imgError, setImgError] = useState(false);

  const halfEligiblePizzas = useMemo(
    () => allProducts.filter((p) => p.allowHalfAndHalf),
    [allProducts]
  );

  const activeFirstProduct = useMemo(() => {
    if (!product) return null;
    return allProducts.find((p) => p.id === firstProductId) ?? product;
  }, [product, allProducts, firstProductId]);

  useEffect(() => {
    if (!product) return;
    setFirstProductId(product.id);
    const defaultSize =
      product.sizes?.find((s) => s.id === 'grande')?.id ??
      product.sizes?.[0]?.id ??
      '';
    setSelectedSizeId(defaultSize);
    setIsHalfAndHalf(Boolean(product.allowHalfAndHalf && initialHalfAndHalf));
    setSecondHalfId('');
    setSelectedComboFlavor(product.comboFlavors?.[0] ?? '');
    setSelectedAddonIds([]);
    setQuantity(1);
    setNotes('');
    setHalfError('');
    setImgError(false);
  }, [product, initialHalfAndHalf]);

  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  if (!product || !activeFirstProduct) return null;

  const sizes = activeFirstProduct.sizes ?? [];
  const selectedSize: PizzaSizeOption | null =
    sizes.find((s) => s.id === selectedSizeId) ?? sizes[0] ?? null;

  const secondHalfOptions = halfEligiblePizzas.filter(
    (p) => p.id !== activeFirstProduct.id
  );
  const secondHalfProduct = isHalfAndHalf
    ? secondHalfOptions.find((p) => p.id === secondHalfId) ?? null
    : null;

  const selectedAddons = activeFirstProduct.addons.filter((addon) =>
    selectedAddonIds.includes(addon.id)
  );
  const addonsSum = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);

  const basePrice = getPizzaBasePrice(
    activeFirstProduct,
    selectedSize,
    secondHalfProduct
  );
  const unitTotal = basePrice + addonsSum;
  const total = unitTotal * quantity;

  const toggleAddon = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleFirstHalfChange = (newFirstId: string) => {
    setFirstProductId(newFirstId);
    if (secondHalfId === newFirstId) {
      setSecondHalfId('');
    }
    setSelectedAddonIds([]);
    setImgError(false);
  };

  const handleConfirm = () => {
    if (isHalfAndHalf && !secondHalfProduct) {
      setHalfError('Escolha o segundo sabor para montar sua pizza meio a meio.');
      return;
    }

    onAddToCart({
      product: activeFirstProduct,
      selectedSize,
      secondHalfProduct,
      selectedComboFlavor: activeFirstProduct.comboFlavors?.length
        ? selectedComboFlavor || activeFirstProduct.comboFlavors[0]
        : null,
      selectedAddons,
      quantity,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl dark:bg-[#1A1817] dark:border dark:border-zinc-800"
      >
        <div className="relative h-48 w-full shrink-0 bg-zinc-100 sm:h-56 dark:bg-zinc-800">
          {!imgError ? (
            <img
              src={activeFirstProduct.image}
              alt={activeFirstProduct.name}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-50 to-amber-50 dark:from-zinc-900 dark:to-zinc-800">
              <UtensilsCrossed className="h-10 w-10 text-[#B82925] dark:text-[#F0645E]" aria-hidden="true" />
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes do produto"
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-md backdrop-blur-sm transition-colors hover:bg-white cursor-pointer dark:bg-zinc-900/90 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2
                id="product-modal-title"
                className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-50"
              >
                {isHalfAndHalf
                  ? 'Monte sua Pizza Meio a Meio'
                  : activeFirstProduct.name}
              </h2>
              <span className="font-display text-xl font-bold text-[#B82925] dark:text-[#F0645E] tabular-nums shrink-0">
                {formatBRL(basePrice)}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {isHalfAndHalf && secondHalfProduct
                ? `1/2 ${activeFirstProduct.name} + 1/2 ${secondHalfProduct.name}`
                : activeFirstProduct.description}
            </p>
          </div>

          {sizes.length > 0 && (
            <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Escolha o tamanho
                </h3>
                <span className="text-xs font-medium text-[#B82925] dark:text-[#F0645E]">
                  Obrigatório
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {sizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  const sizeDisplayPrice = getPizzaBasePrice(
                    activeFirstProduct,
                    size,
                    secondHalfProduct
                  );
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSizeId(size.id)}
                      aria-pressed={isSelected}
                      className={`flex min-h-[56px] flex-col items-start justify-center rounded-xl border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#B82925] bg-[#B82925]/10 text-zinc-900 dark:border-[#F0645E] dark:bg-[#F0645E]/15 dark:text-zinc-50'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isSelected ? 'text-[#B82925] dark:text-[#F0645E]' : ''
                          }`}
                        >
                          {size.name}
                        </span>
                        <span className="text-xs font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                          {formatBRL(sizeDisplayPrice)}
                        </span>
                      </div>
                      <span className="mt-0.5 text-xs text-zinc-500 tabular-nums dark:text-zinc-400">
                        {size.slices} fatias
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeFirstProduct.allowHalfAndHalf && (
            <div className="border-t border-zinc-100 pt-5 space-y-4 dark:border-zinc-800">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Sabores
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Inteira ou 2 sabores
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsHalfAndHalf(false);
                    setHalfError('');
                  }}
                  aria-pressed={!isHalfAndHalf}
                  className={`flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    !isHalfAndHalf
                      ? 'border-[#B82925] bg-[#B82925]/10 text-[#B82925] dark:border-[#F0645E] dark:bg-[#F0645E]/15 dark:text-[#F0645E]'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span>Inteira (1 sabor)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsHalfAndHalf(true);
                    setHalfError('');
                  }}
                  aria-pressed={isHalfAndHalf}
                  className={`flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    isHalfAndHalf
                      ? 'border-[#B82925] bg-[#B82925]/10 text-[#B82925] dark:border-[#F0645E] dark:bg-[#F0645E]/15 dark:text-[#F0645E]'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Pizza className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Meio a Meio</span>
                </button>
              </div>

              {isHalfAndHalf && (
                <div className="space-y-4 rounded-2xl border border-zinc-200/80 bg-[#F7F6F3]/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div>
                    <label
                      htmlFor="first-half-select"
                      className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400"
                    >
                      1ª metade
                    </label>
                    <select
                      id="first-half-select"
                      value={activeFirstProduct.id}
                      onChange={(e) => handleFirstHalfChange(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-900 focus:border-[#B82925] focus:outline-none dark:border-zinc-700 dark:bg-[#1A1817] dark:text-zinc-100 dark:focus:border-[#F0645E]"
                    >
                      {halfEligiblePizzas.map((pizza) => {
                        const pPrice = selectedSize
                          ? pizza.sizes?.find((s) => s.id === selectedSize.id)
                              ?.price ?? pizza.price
                          : pizza.price;
                        return (
                          <option key={pizza.id} value={pizza.id}>
                            1/2 {pizza.name} ({formatBRL(pPrice)})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        2ª metade *
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Vale o maior preço entre as metades
                      </span>
                    </div>

                    <div className="mt-2 divide-y divide-zinc-200/70 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-700 dark:bg-[#1A1817]">
                      {secondHalfOptions.map((option) => {
                        const isPicked = secondHalfId === option.id;
                        const optionPrice = selectedSize
                          ? option.sizes?.find((s) => s.id === selectedSize.id)
                              ?.price ?? option.price
                          : option.price;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setSecondHalfId(option.id);
                              setHalfError('');
                            }}
                            aria-pressed={isPicked}
                            className={`flex min-h-[48px] w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                              isPicked
                                ? 'bg-[#B82925]/10 dark:bg-[#F0645E]/15'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                  isPicked
                                    ? 'border-[#B82925] bg-[#B82925] text-white'
                                    : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900'
                                }`}
                              >
                                {isPicked && (
                                  <Check className="h-3 w-3" aria-hidden="true" />
                                )}
                              </span>
                              <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                1/2 {option.name}
                              </span>
                            </div>

                            <span className="text-xs font-semibold text-zinc-600 tabular-nums shrink-0 dark:text-zinc-400">
                              {formatBRL(optionPrice)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {halfError && (
                      <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                        {halfError}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeFirstProduct.comboFlavors && activeFirstProduct.comboFlavors.length > 0 && (
            <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Escolha o sabor do combo
                </h3>
                <span className="text-xs font-medium text-[#B82925] dark:text-[#F0645E]">
                  Obrigatório
                </span>
              </div>

              <div className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200/80 dark:divide-zinc-800 dark:border-zinc-800">
                {activeFirstProduct.comboFlavors.map((flavor) => {
                  const isPicked = selectedComboFlavor === flavor;
                  return (
                    <button
                      key={flavor}
                      type="button"
                      onClick={() => setSelectedComboFlavor(flavor)}
                      aria-pressed={isPicked}
                      className={`flex min-h-[48px] w-full items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                        isPicked
                          ? 'bg-[#B82925]/10 dark:bg-[#F0645E]/15'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isPicked
                            ? 'border-[#B82925] bg-[#B82925] text-white'
                            : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900'
                        }`}
                      >
                        {isPicked && <Check className="h-3 w-3" aria-hidden="true" />}
                      </span>
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {flavor}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeFirstProduct.addons.length > 0 && (
            <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {sizes.length > 0 ? 'Borda e adicionais' : 'Adicionais'}
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Opcional
                </span>
              </div>

              <div className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-200/80 dark:divide-zinc-800 dark:border-zinc-800">
                {activeFirstProduct.addons.map((addon) => {
                  const checked = selectedAddonIds.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      aria-pressed={checked}
                      className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 cursor-pointer dark:hover:bg-zinc-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                            checked
                              ? 'border-[#B82925] bg-[#B82925] text-white'
                              : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900'
                          }`}
                        >
                          {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                        </span>
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {addon.name}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-zinc-600 tabular-nums shrink-0 dark:text-zinc-400">
                        {addon.price > 0 ? `+ ${formatBRL(addon.price)}` : 'Grátis'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
            <label
              htmlFor="item-notes"
              className="block font-display text-base font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Observações
            </label>
            <textarea
              id="item-notes"
              rows={2}
              maxLength={200}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                sizes.length > 0
                  ? 'Ex: massa bem assada, sem cebola, cortar em 8 fatias...'
                  : 'Ex: sabor do refrigerante, sem gelo...'
              }
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-[#F7F6F3] px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#B82925] focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#F0645E] dark:focus:bg-zinc-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-zinc-200/80 bg-white p-4 sm:px-6 dark:border-zinc-800 dark:bg-[#1A1817]">
          <div className="flex items-center rounded-xl border border-zinc-200 bg-[#F7F6F3] p-1 dark:border-zinc-700 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Diminuir quantidade"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-zinc-900 tabular-nums dark:text-zinc-50">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Aumentar quantidade"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 transition-colors hover:bg-white cursor-pointer dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex min-h-[48px] flex-1 items-center justify-between gap-2 rounded-xl bg-[#B82925] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9B201D] active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B82925]"
          >
            <span>Adicionar à sacola</span>
            <span className="tabular-nums font-bold">{formatBRL(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
