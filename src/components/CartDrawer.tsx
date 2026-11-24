import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import {
  CartItem,
  CheckoutFormState,
  DeliveryMode,
  PaymentMethod,
  StoreInfo,
} from '../types/menu';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatBRL,
  formatCartItemTitle,
  getCartItemTotal,
} from '../utils/format';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreInfo;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
}

const INITIAL_FORM: CheckoutFormState = {
  customerName: '',
  deliveryMode: 'delivery',
  address: {
    street: '',
    number: '',
    neighborhood: '',
    complement: '',
  },
  paymentMethod: 'pix',
  changeFor: '',
};

export function CartDrawer({
  isOpen,
  onClose,
  store,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedOrder, setSubmittedOrder] = useState<{
    message: string;
    whatsappUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + getCartItemTotal(item), 0);
  const deliveryFee =
    items.length > 0 && form.deliveryMode === 'delivery' ? store.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  const setDeliveryMode = (mode: DeliveryMode) => {
    setForm((prev) => ({ ...prev, deliveryMode: mode }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.street;
      delete next.number;
      delete next.neighborhood;
      return next;
    });
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    setForm((prev) => ({
      ...prev,
      paymentMethod: method,
      changeFor: method === 'cash' ? prev.changeFor : '',
    }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!form.customerName.trim()) {
      nextErrors.customerName = 'Informe seu nome para identificar o pedido.';
    }

    if (form.deliveryMode === 'delivery') {
      if (!form.address.street.trim()) {
        nextErrors.street = 'Informe a rua ou avenida.';
      }
      if (!form.address.number.trim()) {
        nextErrors.number = 'Informe o número.';
      }
      if (!form.address.neighborhood.trim()) {
        nextErrors.neighborhood = 'Informe o bairro.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (!validate()) return;

    const message = buildWhatsAppMessage({
      store,
      items,
      subtotal,
      deliveryFee,
      total,
      form,
    });
    const whatsappUrl = buildWhatsAppUrl(store.whatsapp, message);

    setSubmittedOrder({ message, whatsappUrl });

    const anchor = document.createElement('a');
    anchor.href = whatsappUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleCopyMessage = async () => {
    if (!submittedOrder) return;
    try {
      await navigator.clipboard.writeText(submittedOrder.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleStartNewOrder = () => {
    setSubmittedOrder(null);
    onClearCart();
    onClose();
  };

  const paymentOptions: { id: PaymentMethod; label: string }[] = [
    { id: 'pix', label: 'Pix' },
    { id: 'credit', label: 'Crédito' },
    { id: 'debit', label: 'Débito' },
    { id: 'cash', label: 'Dinheiro' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Sacola e finalização de pedido"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl dark:bg-[#1A1817] dark:border-l dark:border-zinc-800"
      >
        <div className="flex items-center justify-between border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-[#B82925] dark:text-[#F0645E]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {submittedOrder ? 'Pedido pronto para envio' : 'Sua sacola'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar sacola"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 cursor-pointer dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {submittedOrder ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-[#F7F6F3] p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="font-display text-base font-bold text-zinc-900 dark:text-zinc-50">
                Resumo gerado para o WhatsApp
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Caso a janela do WhatsApp não tenha aberto automaticamente, utilize o botão abaixo.
              </p>

              <pre className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-4 font-sans text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-[#1A1817] dark:text-zinc-200">
                {submittedOrder.message}
              </pre>
            </div>

            <div className="space-y-3">
              <a
                href={submittedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#B82925] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9B201D]"
              >
                <span>Abrir WhatsApp com pedido</span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 cursor-pointer dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-[#2D5A3C] dark:text-[#6DBA87]" aria-hidden="true" />
                    <span>Mensagem copiada</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span>Copiar mensagem do pedido</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittedOrder(null)}
                  className="min-h-[44px] text-sm font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Editar pedido
                </button>
                <button
                  type="button"
                  onClick={handleStartNewOrder}
                  className="min-h-[44px] text-sm font-semibold text-[#B82925] hover:underline cursor-pointer dark:text-[#F0645E]"
                >
                  Limpar e fazer novo pedido
                </button>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#B82925]/10 text-[#B82925] dark:bg-[#F0645E]/15 dark:text-[#F0645E]">
              <ShoppingBag className="h-8 w-8" aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Sua sacola está vazia
            </h3>
            <p className="mt-1.5 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
              Escolha pizzas artesanais, entradas ou bebidas no cardápio para montar seu pedido.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 min-h-[44px] rounded-xl bg-[#B82925] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#9B201D] cursor-pointer"
            >
              Explorar cardápio
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Itens selecionados
                  </h3>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-xs font-medium text-zinc-500 hover:text-red-600 cursor-pointer dark:text-zinc-400 dark:hover:text-red-400"
                  >
                    Limpar sacola
                  </button>
                </div>

                <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200/80 bg-[#F7F6F3]/60 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60">
                  {items.map((item) => (
                    <li key={item.cartItemId} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {formatCartItemTitle(item)}
                          </p>
                          {item.selectedAddons.length > 0 && (
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              Adicionais:{' '}
                              {item.selectedAddons.map((a) => a.name).join(', ')}
                            </p>
                          )}
                          {item.notes && (
                            <p className="mt-1 text-xs italic text-zinc-500 dark:text-zinc-400">
                              Obs: {item.notes}
                            </p>
                          )}
                        </div>

                        <span className="text-sm font-bold text-zinc-900 tabular-nums shrink-0 dark:text-zinc-100">
                          {formatBRL(getCartItemTotal(item))}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                            aria-label={`Diminuir quantidade de ${item.product.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 cursor-pointer dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-zinc-900 tabular-nums dark:text-zinc-100">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                            aria-label={`Aumentar quantidade de ${item.product.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 cursor-pointer dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartItemId)}
                          aria-label={`Remover ${item.product.name} da sacola`}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4 border-t border-zinc-200/80 pt-5 dark:border-zinc-800">
                <div>
                  <label
                    htmlFor="customer-name"
                    className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                  >
                    Seu nome
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    value={form.customerName}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, customerName: e.target.value }));
                      if (errors.customerName) {
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.customerName;
                          return next;
                        });
                      }
                    }}
                    placeholder="Como devemos te chamar?"
                    className="mt-1.5 h-11 w-full rounded-xl border border-zinc-200 bg-[#F7F6F3] px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#B82925] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#F0645E]"
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Como deseja receber?
                  </span>
                  <div className="mt-2 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode('delivery')}
                      aria-pressed={form.deliveryMode === 'delivery'}
                      className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                        form.deliveryMode === 'delivery'
                          ? 'border-[#B82925] bg-[#B82925]/10 text-[#B82925] dark:border-[#F0645E] dark:bg-[#F0645E]/15 dark:text-[#F0645E]'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Entrega</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMode('pickup')}
                      aria-pressed={form.deliveryMode === 'pickup'}
                      className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                        form.deliveryMode === 'pickup'
                          ? 'border-[#B82925] bg-[#B82925]/10 text-[#B82925] dark:border-[#F0645E] dark:bg-[#F0645E]/15 dark:text-[#F0645E]'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Store className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Retirada</span>
                    </button>
                  </div>
                </div>

                {form.deliveryMode === 'delivery' ? (
                  <div className="space-y-3 rounded-2xl border border-zinc-200/80 bg-[#F7F6F3]/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      <MapPin className="h-4 w-4 text-[#B82925] dark:text-[#F0645E]" aria-hidden="true" />
                      <span>Endereço de entrega</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label htmlFor="addr-street" className="sr-only">
                          Rua ou Avenida
                        </label>
                        <input
                          id="addr-street"
                          type="text"
                          value={form.address.street}
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              address: { ...prev.address, street: e.target.value },
                            }));
                            if (errors.street) {
                              setErrors((prev) => {
                                const next = { ...prev };
                                delete next.street;
                                return next;
                              });
                            }
                          }}
                          placeholder="Rua / Avenida *"
                          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#B82925] focus:outline-none dark:border-zinc-700 dark:bg-[#1A1817] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#F0645E]"
                        />
                        {errors.street && (
                          <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                            {errors.street}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="addr-number" className="sr-only">
                          Número
                        </label>
                        <input
                          id="addr-number"
                          type="text"
                          value={form.address.number}
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              address: { ...prev.address, number: e.target.value },
                            }));
                            if (errors.number) {
                              setErrors((prev) => {
                                const next = { ...prev };
                                delete next.number;
                                return next;
                              });
                            }
                          }}
                          placeholder="Número *"
                          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#B82925] focus:outline-none dark:border-zinc-700 dark:bg-[#1A1817] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#F0645E]"
                        />
                        {errors.number && (
                          <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                            {errors.number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="addr-neighborhood" className="sr-only">
                          Bairro
                        </label>
                        <input
                          id="addr-neighborhood"
                          type="text"
                          value={form.address.neighborhood}
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              address: { ...prev.address, neighborhood: e.target.value },
                            }));
                            if (errors.neighborhood) {
                              setErrors((prev) => {
                                const next = { ...prev };
                                delete next.neighborhood;
                                return next;
                              });
                            }
                          }}
                          placeholder="Bairro *"
                          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#B82925] focus:outline-none dark:border-zinc-700 dark:bg-[#1A1817] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#F0645E]"
                        />
                        {errors.neighborhood && (
                          <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                            {errors.neighborhood}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="addr-complement" className="sr-only">
                          Complemento
                        </label>
                        <input
                          id="addr-complement"
                          type="text"
                          value={form.address.complement}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              address: { ...prev.address, complement: e.target.value },
                            }))
                          }
                          placeholder="Apto, bloco, referência"
                          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#B82925] focus:outline-none dark:border-zinc-700 dark:bg-[#1A1817] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#F0645E]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-zinc-200/80 bg-[#F7F6F3]/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                    <p className="font-semibold text-[#2D5A3C] dark:text-[#6DBA87]">
                      Retirada sem taxa no balcão
                    </p>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                      {store.pickupAddress}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    <CreditCard className="h-4 w-4 text-[#B82925] dark:text-[#F0645E]" aria-hidden="true" />
                    <span>Forma de pagamento</span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {paymentOptions.map((opt) => {
                      const active = form.paymentMethod === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPaymentMethod(opt.id)}
                          aria-pressed={active}
                          className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                            active
                              ? 'border-[#B82925] bg-[#B82925]/10 text-[#B82925] dark:border-[#F0645E] dark:bg-[#F0645E]/15 dark:text-[#F0645E]'
                              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {form.paymentMethod === 'cash' && (
                    <div className="mt-3">
                      <label htmlFor="change-for" className="sr-only">
                        Troco para quanto?
                      </label>
                      <input
                        id="change-for"
                        type="text"
                        value={form.changeFor}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, changeFor: e.target.value }))
                        }
                        placeholder="Troco para quanto? (ex: R$ 100,00 ou sem troco)"
                        className="h-11 w-full rounded-xl border border-zinc-200 bg-[#F7F6F3] px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#B82925] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-[#F0645E]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200/80 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-[#1A1817]">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium">{formatBRL(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Taxa de entrega</span>
                  <span className="tabular-nums font-medium">
                    {form.deliveryMode === 'delivery'
                      ? formatBRL(deliveryFee)
                      : 'Grátis'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-100 pt-2 text-base font-bold text-zinc-900 dark:border-zinc-800 dark:text-zinc-50">
                  <span>Total do pedido</span>
                  <span className="font-display text-lg tabular-nums text-[#B82925] dark:text-[#F0645E]">
                    {formatBRL(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#B82925] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9B201D] active:scale-[0.99] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B82925]"
              >
                <span>Finalizar pedido no WhatsApp</span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
