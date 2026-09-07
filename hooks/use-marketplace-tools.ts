'use client';
import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import type { Catalog } from '@/lib/types';
import { validateSelection } from '@/lib/marketplace';
import type { MarketplaceRoute } from './use-marketplace-route';
interface Tool {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean };
  execute: (input: unknown) => unknown;
}
interface ModelContext {
  registerTool: (
    tool: Tool,
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
}
export function useMarketplaceTools(
  catalog: Catalog | null,
  navigate: (route: MarketplaceRoute, replace?: boolean) => void,
) {
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext })
      .modelContext;
    if (!catalog || !context?.registerTool) return;
    const lifecycle = new AbortController();
    const tools: Tool[] = [
      {
        name: 'get_marketplace_products',
        title: 'Browse marketplace products',
        description:
          'Read products, available variants and EMI plans. Does not change the page.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: () => ({
          products: catalog.products.map((p) => ({
            id: p.id,
            name: p.name,
            variants: p.variants,
          })),
          plans: catalog.plans,
        }),
      },
      {
        name: 'stage_emi_plan',
        title: 'Select product and EMI plan',
        description:
          'Open a product with a selected available variant and EMI plan. Does not confirm a selection or create an order or loan.',
        inputSchema: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
            variantId: { type: 'string' },
            planId: { type: 'string' },
          },
          required: ['productId', 'variantId', 'planId'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: (input) => {
          if (!input || typeof input !== 'object')
            throw new Error('Expected productId, variantId and planId.');
          const values = input as Record<string, unknown>;
          if (
            typeof values.productId !== 'string' ||
            typeof values.variantId !== 'string' ||
            typeof values.planId !== 'string'
          )
            throw new Error('Product, variant and plan IDs must be strings.');
          const selection = validateSelection(
            catalog,
            values.productId,
            values.variantId,
            values.planId,
          );
          flushSync(() =>
            navigate({
              product: selection.product.id,
              variant: selection.variant.id,
              plan: selection.plan.id,
            }),
          );
          return {
            status: 'staged',
            product: selection.product.name,
            variant: selection.variant.label,
            months: selection.plan.months,
            ...selection.payment,
          };
        },
      },
    ];
    for (const tool of tools) {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {
          /* Optional browser capability; normal UI stays available. */
        });
      } catch {
        /* Unsupported contexts keep the normal UI. */
      }
    }
    return () => lifecycle.abort();
  }, [catalog, navigate]);
}
