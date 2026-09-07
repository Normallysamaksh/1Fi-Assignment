import type { Catalog, EmiPlan, Product } from './types';
export const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
export const preciseMoney = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
export function quote(price: number, plan: EmiPlan) {
  if (
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(plan.months) ||
    plan.months < 1 ||
    plan.months > 60 ||
    !Number.isFinite(plan.interestPercent) ||
    plan.interestPercent < 0 ||
    !Number.isFinite(plan.processingFee) ||
    plan.processingFee < 0
  )
    throw new Error('Invalid price or EMI plan.');
  const principal = Math.round(price * 100);
  const interest = Math.round((principal * plan.interestPercent) / 100);
  const totalPaise =
    principal + interest + Math.round(plan.processingFee * 100);
  const monthlyPaise = Math.floor(totalPaise / plan.months);
  return {
    monthly: monthlyPaise / 100,
    finalPayment: (totalPaise - monthlyPaise * (plan.months - 1)) / 100,
    total: totalPaise / 100,
    interest: interest / 100,
  };
}
export function startingPrice(product: Product) {
  return Math.min(
    ...product.variants.filter((v) => v.available).map((v) => v.price),
  );
}
export async function fetchCatalog(signal?: AbortSignal): Promise<Catalog> {
  const response = await fetch('/data/catalog.json', { signal });
  if (!response.ok)
    throw new Error('We couldn’t load the marketplace. Please try again.');
  const data: Catalog = await response.json();
  if (
    !Array.isArray(data.products) ||
    !Array.isArray(data.plans) ||
    !data.plans.length
  )
    throw new Error('Product information is unavailable. Please try again.');
  return data;
}

export function validateSelection(
  catalog: Catalog,
  productId: string,
  variantId: string,
  planId: string,
) {
  const product = catalog.products.find((p) => p.id === productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  const plan = catalog.plans.find((p) => p.id === planId);
  if (!product || !variant || !plan)
    throw new Error(
      'This selection is no longer available. Please select again.',
    );
  if (!variant.available)
    throw new Error('This variant is out of stock. Please choose another.');
  return { product, variant, plan, payment: quote(variant.price, plan) };
}
