'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ProductImage } from './product-image';
import { useMarketplaceTools } from '@/hooks/use-marketplace-tools';
import {
  ArrowRight,
  BadgeCheck,
  ChartNoAxesCombined,
  ChevronRight,
  Headphones,
  House,
  Laptop,
  LayoutGrid,
  Percent,
  ReceiptText,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  UserRound,
  Watch,
  X,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { fetchCatalog, money, quote, startingPrice } from '@/lib/marketplace';
import type { Catalog, Category, Product } from '@/lib/types';
import { ProductDetail } from './product-detail';
import { useMarketplaceRoute } from '@/hooks/use-marketplace-route';

const categories: { name: Category; icon: typeof Smartphone }[] = [
  { name: 'All products', icon: LayoutGrid },
  { name: 'Smartphones', icon: Smartphone },
  { name: 'Laptops', icon: Laptop },
  { name: 'Audio', icon: Headphones },
  { name: 'Wearables', icon: Watch },
];
const nav = [
  { label: 'Home', icon: House },
  { label: 'Shop', icon: Store },
  { label: 'EMI Dues', icon: ReceiptText },
  { label: 'Limit', icon: ChartNoAxesCombined },
  { label: 'Profile', icon: UserRound },
];

export function Marketplace() {
  const { route, navigate } = useMarketplaceRoute();
  const [data, setData] = useState<Catalog | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState('marketplace');
  const [category, setCategory] = useState<Category>('All products');
  const [search, setSearch] = useState('');
  useMarketplaceTools(data, navigate);
  const retry = () => {
    setError('');
    setData(null);
    setAttempt((a) => a + 1);
  };
  const backToCatalog = () => {
    navigate({ product: '', variant: '', plan: '' });
    setTab('marketplace');
    document.title = '1Fi Marketplace | Shop today. Pay later.';
  };
  const openProduct = (product: Product) => {
    navigate({ product: product.id, variant: '', plan: '' });
  };
  useEffect(() => {
    const controller = new AbortController();
    fetchCatalog(controller.signal)
      .then(setData)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      });
    return () => controller.abort();
  }, [attempt]);
  const products =
    data?.products.filter(
      (p) =>
        (category === 'All products' || p.category === category) &&
        `${p.brand} ${p.name} ${p.category}`
          .toLowerCase()
          .includes(search.toLowerCase().trim()),
    ) ?? [];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to products
      </a>
      <header className="desktop-header">
        <button
          onClick={backToCatalog}
          className="brand brand-button"
          aria-label="1Fi Shop"
        >
          1Fi<span className="brand-dot">.</span>
        </button>
        <nav aria-label="Main navigation">
          {nav.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={label === 'Shop' ? 'nav-item active' : 'nav-item'}
              disabled={label !== 'Shop'}
              onClick={backToCatalog}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>
        <span className="header-note">
          <ShieldCheck size={17} /> Backed by your investments
        </span>
      </header>
      <main id="main" className="main-wrap">
        {route.product ? (
          data ? (
            data.products.find((p) => p.id === route.product) ? (
              <ProductDetail
                key={route.product}
                product={data.products.find((p) => p.id === route.product)!}
                catalog={data}
                route={route}
                navigate={navigate}
                onBack={backToCatalog}
              />
            ) : (
              <Empty className="state-panel">
                <EmptyTitle>Product not found</EmptyTitle>
                <EmptyDescription>
                  This product is no longer available.
                </EmptyDescription>
                <button className="primary-button" onClick={backToCatalog}>
                  Back to Marketplace
                </button>
              </Empty>
            )
          ) : error ? (
            <Empty className="state-panel" role="alert">
              <EmptyTitle>Product couldn’t load</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
              <button className="primary-button" onClick={retry}>
                Try again
              </button>
            </Empty>
          ) : (
            <div
              className="detail-loading"
              aria-busy="true"
              aria-label="Loading product"
            >
              <Skeleton />
              <Skeleton />
            </div>
          )
        ) : (
          <>
            <div className="page-caption">
              <span>Shop with 1Fi</span>
              <span>MORE POSSIBILITIES. ZERO INTEREST.</span>
            </div>
            <section
              className="shop-banner"
              aria-label="Shop today, pay later using mutual funds"
            >
              <div className="banner-copy">
                <span className="banner-pill">
                  <Sparkles size={14} /> NO-COST EMIs
                </span>
                <h1>
                  Shop today.
                  <br />
                  <em>Pay later</em> using mutual funds.
                </h1>
                <p>
                  No credit score required. No interest.
                  <br className="mobile-break" /> Backed by your investments.
                </p>
              </div>
              <div className="banner-art" aria-hidden="true">
                <Image
                  unoptimized
                  src="/shop-reference.jpeg"
                  width={719}
                  height={1600}
                  alt=""
                  priority
                />
              </div>
              <div className="banner-note">
                <span>YOUR NEXT UPGRADE</span>
                <strong>Closer than you think.</strong>
              </div>
            </section>
            <Tabs className="shop-tabs" value={tab} onValueChange={setTab}>
              <TabsList className="shop-tab-list" aria-label="Shop sections">
                <TabsTrigger value="brands">Top Brands</TabsTrigger>
                <TabsTrigger value="nearby">Nearby Stores</TabsTrigger>
                <TabsTrigger value="marketplace">
                  <Store size={17} />
                  1Fi Marketplace<span className="new-label">NEW</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="brands">
                <div
                  className="blank-tab"
                  aria-label="Top Brands, not included in this assignment"
                />
              </TabsContent>
              <TabsContent value="nearby">
                <div
                  className="blank-tab"
                  aria-label="Nearby Stores, not included in this assignment"
                />
              </TabsContent>
              <TabsContent value="marketplace" className="catalog-panel">
                <div className="catalog-heading">
                  <div>
                    <span className="eyebrow">THE 1FI MARKETPLACE</span>
                    <h2>Your next favourite, on your terms.</h2>
                    <p>
                      Discover products you love. Split the cost, keep the
                      possibilities.
                    </p>
                  </div>
                  <span className="zero-badge">
                    <Percent size={17} /> No-cost EMI on every product
                  </span>
                </div>
                <div className="catalog-controls">
                  <label className="search-box">
                    <Search size={21} />
                    <input
                      placeholder="Search products, brands and more"
                      aria-label="Search products"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        aria-label="Clear search"
                        onClick={() => setSearch('')}
                      >
                        <X size={18} />
                      </button>
                    )}
                  </label>
                  <div
                    className="category-list"
                    aria-label="Filter by category"
                  >
                    {categories.map(({ name, icon: Icon }) => (
                      <button
                        key={name}
                        className={
                          category === name ? 'category active' : 'category'
                        }
                        aria-pressed={category === name}
                        onClick={() => setCategory(name)}
                      >
                        <Icon size={17} />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="results-line">
                  <h3>
                    {category === 'All products'
                      ? 'Handpicked for you'
                      : category}
                    <span>
                      {data ? `${products.length} products` : 'Loading…'}
                    </span>
                  </h3>
                  <span className="results-note">
                    A little upgrade. A smarter way to pay.
                  </span>
                </div>
                {error ? (
                  <Empty className="state-panel" role="alert">
                    <EmptyTitle>Something didn’t load</EmptyTitle>
                    <EmptyDescription>{error}</EmptyDescription>
                    <button className="primary-button" onClick={retry}>
                      Try again
                    </button>
                  </Empty>
                ) : !data ? (
                  <div
                    className="product-grid"
                    aria-label="Loading products"
                    aria-busy="true"
                  >
                    {Array.from({ length: 6 }, (_, i) => (
                      <Skeleton key={i} className="product-skeleton" />
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <Empty className="state-panel">
                    <Search size={34} />
                    <EmptyTitle>No products found</EmptyTitle>
                    <EmptyDescription>
                      Try a different search or browse all products.
                    </EmptyDescription>
                    <button
                      className="primary-button"
                      onClick={() => {
                        setSearch('');
                        setCategory('All products');
                      }}
                    >
                      Clear filters
                    </button>
                  </Empty>
                ) : (
                  <div className="product-grid">
                    {products.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        data={data}
                        onOpen={() => openProduct(p)}
                      />
                    ))}
                  </div>
                )}
                <div className="trust-strip">
                  <span>
                    <ShieldCheck /> Secure shopping
                  </span>
                  <span>
                    <BadgeCheck /> Genuine products
                  </span>
                  <span>
                    <Percent /> No hidden charges
                  </span>
                </div>
                <footer className="catalog-footer">
                  <span className="brand">
                    1Fi<span className="brand-dot">.</span>
                  </span>
                  <p>Big possibilities. Smaller payments.</p>
                  <small>Assignment demo · Sample prices and EMI plans</small>
                </footer>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {nav.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={label === 'Shop' ? 'active' : ''}
            disabled={label !== 'Shop'}
            onClick={backToCatalog}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function ProductCard({
  product,
  data,
  onOpen,
}: {
  product: Product;
  data: Catalog;
  onOpen: () => void;
}) {
  const variant = product.variants
    .filter((v) => v.available)
    .reduce((a, b) => (a.price < b.price ? a : b));
  const plan = data.plans.reduce((a, b) => (a.months > b.months ? a : b));
  return (
    <a
      className="product-card"
      href={`?product=${product.id}`}
      onClick={(event) => {
        if (
          !event.ctrlKey &&
          !event.metaKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="product-visual">
        <span className="product-badge">{product.badge}</span>
        <ProductImage product={product} />
        <span className="view-product" aria-hidden="true">
          <ArrowRight size={20} />
        </span>
      </div>
      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <h3>{product.name}</h3>
        <p className="variant-caption">
          {variant.label} <span>·</span> {product.color}
        </p>
        <div className="price-line">
          <strong>{money(startingPrice(product))}</strong>
          <s>{money(variant.mrp)}</s>
          <span>
            {Math.round((1 - variant.price / variant.mrp) * 100)}% off
          </span>
        </div>
        <div className="emi-card">
          <span>
            <span className="emi-icon">
              <Percent size={15} />
            </span>
            From <strong>{money(quote(variant.price, plan).monthly)}</strong>
            <span>/mo</span>
          </span>
          <ChevronRight size={17} />
          <small>No-cost EMI · up to {plan.months} months</small>
        </div>
      </div>
    </a>
  );
}
