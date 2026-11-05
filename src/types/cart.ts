export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  color: string;
  size: string;
  price: number;
  qty: number;
}

export interface CartSnapshot {
  items: CartLine[];
  hydrated: boolean;
}
