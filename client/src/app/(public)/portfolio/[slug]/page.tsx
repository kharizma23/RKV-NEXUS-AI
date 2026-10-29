import React from 'react';
import { PublicPortfolio } from '@/components/portfolio/PublicPortfolio';

export default function PublicPortfolioPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PublicPortfolio urlSlug={params.slug} />
    </div>
  );
}
