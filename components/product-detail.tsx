'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  Info,
  LockKeyhole,
  Percent,
  ShieldCheck,
  Sparkles,
  ZoomIn,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProductImage } from './product-image';
import {
  money,
  preciseMoney,
  quote,
  validateSelection,
} from '@/lib/marketplace';
import type { Catalog, EmiPlan, Product, Variant } from '@/lib/types';
import type { MarketplaceRoute } from '@/hooks/use-marketplace-route';
interface Props {
  product: Product;
  catalog: Catalog;
  route: MarketplaceRoute;
  navigate: (route: MarketplaceRoute, replace?: boolean) => void;
  onBack: () => void;
}

export function ProductDetail({
  product,
  catalog,
  route,
  navigate,
  onBack,
}: Props) {
  const variant =
    product.variants.find((v) => v.id === route.variant && v.available) ??
    product.variants
      .filter((v) => v.available)
      .reduce((a, b) => (a.price < b.price ? a : b));
  const plan =
    catalog.plans.find((p) => p.id === route.plan) ??
    catalog.plans.find((p) => p.recommended) ??
    catalog.plans[0];
  const [review, setReview] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const payment = quote(variant.price, plan);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    document.title = `${product.name} | 1Fi Marketplace`;
  }, [product.name]);
  function select(variantId: string, planId: string) {
    setConfirmed(false);
    navigate({ product: product.id, variant: variantId, plan: planId }, true);
  }
  function confirm() {
    setError('');
    try {
      validateSelection(catalog, product.id, variant.id, plan.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Please check your selection.');
      return;
    }
    setBusy(true);
    // Simulates a backend handoff. No loan or order is created in this assignment.
    timer.current = setTimeout(() => {
      setBusy(false);
      setConfirmed(true);
    }, 400);
  }
  return (
    <div className="detail-page">
      <div className="detail-breadcrumb">
        <button onClick={onBack}>
          <ArrowLeft size={18} /> Marketplace
        </button>
        <span>/</span>
        <span>{product.name}</span>
      </div>
      <div className="detail-grid">
        <div className="detail-left">
          <button
            className="detail-image"
            onClick={() => setZoom(true)}
            aria-label={`Enlarge ${product.name} image`}
          >
            <span className="product-badge">{product.badge}</span>
            <ProductImage product={product} />
            <span className="zoom-label">
              <ZoomIn size={16} /> Take a closer look
            </span>
          </button>
          <div className="detail-assurances">
            <span>
              <BadgeCheck size={18} /> Genuine product
            </span>
            <span>
              <ShieldCheck size={18} /> Secure with 1Fi
            </span>
          </div>
          <section className="spec-section">
            <h2>Good to know</h2>
            <div className="spec-grid">
              {product.specs.map((s) => (
                <div key={s.label}>
                  <span>{s.label}</span>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>
            <ul>
              {product.highlights.map((h) => (
                <li key={h}>
                  <Check size={16} />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="detail-right">
          <span className="eyebrow">{product.brand.toUpperCase()}</span>
          <h1 ref={heading} tabIndex={-1}>
            {product.name}
          </h1>
          <p className="product-tagline">{product.tagline}</p>
          <div className="detail-price price-line">
            <strong>{money(variant.price)}</strong>
            <s>{money(variant.mrp)}</s>
            <span>Save {money(variant.mrp - variant.price)}</span>
          </div>
          <p className="tax-note">Inclusive of all taxes</p>
          <div className="color-line">
            <span>Colour</span>
            <i style={{ backgroundColor: product.swatch }} />
            <strong>{product.color}</strong>
          </div>
          <fieldset className="variant-field">
            <legend>Choose your variant</legend>
            <RadioGroup
              className="variant-options"
              value={variant.id}
              onValueChange={(v) => select(String(v), plan.id)}
              aria-label="Product variant"
            >
              {product.variants.map((v) => (
                <label
                  key={v.id}
                  className={`variant-option ${variant.id === v.id ? 'selected' : ''} ${!v.available ? 'unavailable' : ''}`}
                >
                  <RadioGroupItem value={v.id} disabled={!v.available} />
                  <span>
                    {v.label}
                    {!v.available && <small>Out of stock</small>}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </fieldset>
          <section className="plan-section" aria-labelledby="plan-title">
            <div className="plan-heading">
              <span className="plan-heading-icon">
                <Percent size={22} />
              </span>
              <div>
                <h2 id="plan-title">Make it yours, one month at a time.</h2>
                <p>Choose your no-cost EMI plan</p>
              </div>
            </div>
            <RadioGroup
              className="plan-list"
              value={plan.id}
              onValueChange={(p) => select(variant.id, String(p))}
              aria-label="EMI plan"
            >
              {catalog.plans.map((p) => (
                <PlanOption
                  key={p.id}
                  plan={p}
                  price={variant.price}
                  selected={p.id === plan.id}
                />
              ))}
            </RadioGroup>
            <div className="plan-reassurance">
              <ShieldCheck size={16} />
              <span>
                0% interest. Zero processing fees. Just your product price.
              </span>
            </div>
          </section>
          <section
            className="payment-summary"
            aria-labelledby="breakdown-title"
            aria-live="polite"
          >
            <h2 id="breakdown-title">Your payment breakdown</h2>
            <dl>
              <div>
                <dt>Product price</dt>
                <dd>{money(variant.price)}</dd>
              </div>
              <div>
                <dt>Interest ({plan.interestPercent}%)</dt>
                <dd className="green">{money(payment.interest)}</dd>
              </div>
              <div>
                <dt>Processing fee</dt>
                <dd className="green">{money(plan.processingFee)}</dd>
              </div>
              <div className="total-row">
                <dt>Total payable</dt>
                <dd>{money(payment.total)}</dd>
              </div>
            </dl>
            <p className="rounding-note">
              {plan.months - 1} payments of {preciseMoney(payment.monthly)} and
              a final payment of {preciseMoney(payment.finalPayment)}.
            </p>
          </section>
          <div className="proceed-area">
            <div>
              <span>Your selected plan</span>
              <strong>
                {preciseMoney(payment.monthly)}
                <small>/month</small>
              </strong>
              <p>for {plan.months} months · 0% interest</p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                setConfirmed(false);
                setError('');
                setReview(true);
              }}
            >
              Proceed with plan <ArrowRight size={18} />
            </button>
          </div>
          <p className="demo-note">
            <Info size={14} /> Sample EMI plans. Final eligibility and terms
            require a connected backend.
          </p>
        </div>
      </div>
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="zoom-dialog">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.color} · Product image</DialogDescription>
          <ProductImage product={product} />
        </DialogContent>
      </Dialog>
      <Dialog
        open={review}
        onOpenChange={(open) => {
          if (!busy) setReview(open);
        }}
      >
        <DialogContent className="review-dialog" showCloseButton={!busy}>
          {confirmed ? (
            <>
              <div className="confirmation-icon">
                <CircleCheck size={40} />
              </div>
              <DialogTitle className="review-title">
                Your plan is selected.
              </DialogTitle>
              <DialogDescription className="review-description">
                {product.name}, {variant.label} in {product.color}. Your
                upgrade, on your terms.
              </DialogDescription>
              <div className="confirmation-payment">
                <span>{plan.months}-month no-cost EMI</span>
                <strong>
                  {preciseMoney(payment.monthly)}
                  <small>/month</small>
                </strong>
                <span>Total payable {money(payment.total)}</span>
              </div>
              <p className="demo-confirmation">
                Demo complete. No order, payment or loan has been created.
              </p>
              <button
                className="primary-button"
                onClick={() => {
                  setReview(false);
                  onBack();
                }}
              >
                Continue exploring <ArrowRight size={18} />
              </button>
              <button className="text-button" onClick={() => setReview(false)}>
                Back to product
              </button>
            </>
          ) : (
            <>
              <span className="eyebrow">ONE LAST LOOK</span>
              <DialogTitle className="review-title">
                Review your plan
              </DialogTitle>
              <DialogDescription>
                Make sure everything looks right before continuing.
              </DialogDescription>
              <div className="review-product">
                <ProductImage product={product} />
                <div>
                  <small>{product.brand}</small>
                  <h3>{product.name}</h3>
                  <p>
                    {variant.label} · {product.color}
                  </p>
                  <strong>{money(variant.price)}</strong>
                </div>
              </div>
              <Summary variant={variant} plan={plan} />
              <div className="review-security">
                <LockKeyhole size={17} />
                <p>
                  This is a demo selection. Confirming will not charge you or
                  apply for a loan.
                </p>
              </div>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <button
                className="primary-button"
                disabled={busy}
                onClick={confirm}
              >
                {busy ? 'Confirming…' : 'Confirm selection'}
                {!busy && <ArrowRight size={18} />}
              </button>
              <button
                className="text-button"
                disabled={busy}
                onClick={() => setReview(false)}
              >
                Change my plan
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function PlanOption({
  plan,
  price,
  selected,
}: {
  plan: EmiPlan;
  price: number;
  selected: boolean;
}) {
  const payment = quote(price, plan);
  return (
    <label className={`plan-option ${selected ? 'selected' : ''}`}>
      <RadioGroupItem value={plan.id} />
      <div>
        <strong>{plan.months} months</strong>
        <span>{plan.interestPercent}% interest</span>
      </div>
      <div className="plan-amount">
        <strong>
          {preciseMoney(payment.monthly)}
          <small>/mo</small>
        </strong>
        {plan.recommended ? (
          <span className="recommended">
            <Sparkles size={11} /> Recommended
          </span>
        ) : (
          <span>No-cost EMI</span>
        )}
      </div>
    </label>
  );
}
function Summary({ variant, plan }: { variant: Variant; plan: EmiPlan }) {
  const p = quote(variant.price, plan);
  return (
    <div className="review-summary">
      <div>
        <span>Monthly payment</span>
        <strong>{preciseMoney(p.monthly)}</strong>
      </div>
      <div>
        <span>Duration</span>
        <strong>{plan.months} months</strong>
      </div>
      <div>
        <span>Interest + processing fee</span>
        <strong className="green">
          {money(p.interest + plan.processingFee)}
        </strong>
      </div>
      <div className="total-row">
        <span>Total payable</span>
        <strong>{money(p.total)}</strong>
      </div>
      <small>
        Final payment: {preciseMoney(p.finalPayment)}. Rounding is included in
        the total.
      </small>
    </div>
  );
}
