export interface StoreInfo {
  name: string;
  subtitle: string;
  logo?: string;
  whatsapp: string;
  deliveryFee: number;
  deliveryTime: string;
  pickupAddress: string;
  openingHours: string;
  heroImage: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface PizzaSizeOption {
  id: string;
  name: string;
  slices: number;
  price: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  featured?: boolean;
  allowHalfAndHalf?: boolean;
  sizes?: PizzaSizeOption[];
  comboFlavors?: string[];
  addons: Addon[];
}

export interface MenuData {
  store: StoreInfo;
  categories: Category[];
  products: Product[];
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  selectedSize?: PizzaSizeOption | null;
  secondHalfProduct?: Product | null;
  selectedComboFlavor?: string | null;
  selectedAddons: Addon[];
  quantity: number;
  notes: string;
}

export type DeliveryMode = 'delivery' | 'pickup';

export type PaymentMethod = 'pix' | 'credit' | 'debit' | 'cash';

export interface CustomerAddress {
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
}

export interface CheckoutFormState {
  customerName: string;
  deliveryMode: DeliveryMode;
  address: CustomerAddress;
  paymentMethod: PaymentMethod;
  changeFor: string;
}
