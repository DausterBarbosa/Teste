import { CartItem, CheckoutFormState, PaymentMethod, PizzaSizeOption, Product, StoreInfo } from '../types/menu';

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatBRL(value: number): string {
  return brlFormatter.format(value);
}

export function getPizzaBasePrice(
  product: Product,
  selectedSize?: PizzaSizeOption | null,
  secondHalfProduct?: Product | null
): number {
  if (!selectedSize) {
    return product.price;
  }

  const firstSizePrice =
    product.sizes?.find((s) => s.id === selectedSize.id)?.price ?? selectedSize.price;

  if (secondHalfProduct) {
    const secondSizePrice =
      secondHalfProduct.sizes?.find((s) => s.id === selectedSize.id)?.price ??
      secondHalfProduct.price;
    return Math.max(firstSizePrice, secondSizePrice);
  }

  return firstSizePrice;
}

export function getCartItemUnitPrice(item: CartItem): number {
  const basePrice = getPizzaBasePrice(
    item.product,
    item.selectedSize,
    item.secondHalfProduct
  );
  const addonsTotal = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  return basePrice + addonsTotal;
}

export function getCartItemTotal(item: CartItem): number {
  return getCartItemUnitPrice(item) * item.quantity;
}

export function formatCartItemTitle(item: CartItem): string {
  if (item.selectedSize) {
    const sizeLabel = `${item.selectedSize.name} (${item.selectedSize.slices} fatias)`;
    if (item.secondHalfProduct) {
      return `Pizza ${sizeLabel} — Meio a Meio: 1/2 ${item.product.name} + 1/2 ${item.secondHalfProduct.name}`;
    }
    return `Pizza ${item.product.name} — ${sizeLabel}`;
  }

  if (item.selectedComboFlavor) {
    return `${item.product.name} (${item.selectedComboFlavor})`;
  }

  return item.product.name;
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'pix':
      return 'Pix';
    case 'credit':
      return 'Cartão de Crédito';
    case 'debit':
      return 'Cartão de Débito';
    case 'cash':
      return 'Dinheiro';
  }
}

export function buildWhatsAppMessage(params: {
  store: StoreInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  form: CheckoutFormState;
}): string {
  const { store, items, subtotal, deliveryFee, total, form } = params;

  const lines: string[] = [
    `*Novo Pedido — ${store.name}*`,
    '',
    '*Itens do pedido:*',
  ];

  items.forEach((item, index) => {
    const unitPrice = getCartItemUnitPrice(item);
    const lineTotal = unitPrice * item.quantity;
    const itemTitle = formatCartItemTitle(item);
    lines.push(`${index + 1}. ${item.quantity}x ${itemTitle} (${formatBRL(lineTotal)})`);

    if (item.selectedAddons.length > 0) {
      const addonNames = item.selectedAddons
        .map((addon) =>
          addon.price > 0 ? `${addon.name} (+${formatBRL(addon.price)})` : addon.name
        )
        .join(', ');
      lines.push(`   Adicionais/Borda: ${addonNames}`);
    }

    if (item.notes.trim()) {
      lines.push(`   Obs: ${item.notes.trim()}`);
    }
  });

  lines.push('');
  lines.push('*Cliente:* ' + (form.customerName.trim() || 'Não informado'));

  if (form.deliveryMode === 'delivery') {
    const { street, number, neighborhood, complement } = form.address;
    const addressLine = `${street.trim()}, ${number.trim()} — ${neighborhood.trim()}`;
    lines.push('*Recebimento:* Entrega (Delivery)');
    lines.push(`*Endereço:* ${addressLine}`);
    if (complement.trim()) {
      lines.push(`*Complemento:* ${complement.trim()}`);
    }
  } else {
    lines.push('*Recebimento:* Retirada no balcão');
    lines.push(`*Local:* ${store.pickupAddress}`);
  }

  lines.push(`*Pagamento:* ${getPaymentMethodLabel(form.paymentMethod)}`);
  if (form.paymentMethod === 'cash' && form.changeFor.trim()) {
    lines.push(`*Troco para:* ${form.changeFor.trim()}`);
  }

  lines.push('');
  lines.push(`Subtotal: ${formatBRL(subtotal)}`);
  lines.push(
    `Taxa de entrega: ${form.deliveryMode === 'delivery' ? formatBRL(deliveryFee) : 'Grátis (Retirada)'}`
  );
  lines.push(`*Total: ${formatBRL(total)}*`);

  return lines.join('\n');
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const sanitized = whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}
