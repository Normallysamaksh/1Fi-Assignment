'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import type { Product } from '@/lib/types';
export function ProductImage({
  product,
  className = '',
}: {
  product: Product;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className={`image-fallback ${className}`}>
      <ImageOff size={40} />
      <span>{product.name}</span>
      <small>Image unavailable</small>
    </div>
  ) : (
    <Image
      unoptimized
      width={1200}
      height={1200}
      className={className}
      src={product.image}
      alt={`${product.brand} ${product.name} in ${product.color}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
