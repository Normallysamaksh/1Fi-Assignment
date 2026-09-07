export type Category =
  | 'All products'
  | 'Smartphones'
  | 'Laptops'
  | 'Audio'
  | 'Wearables';
export interface Variant {
  id: string;
  label: string;
  price: number;
  mrp: number;
  available: boolean;
}
export interface Product {
  id: string;
  brand: string;
  name: string;
  category: Category;
  tagline: string;
  badge: string;
  image: string;
  imageSource: string;
  color: string;
  swatch: string;
  variants: Variant[];
  specs: { label: string; value: string }[];
  highlights: string[];
}
export interface EmiPlan {
  id: string;
  months: number;
  interestPercent: number;
  processingFee: number;
  recommended?: boolean;
}
export interface Catalog {
  products: Product[];
  plans: EmiPlan[];
}
