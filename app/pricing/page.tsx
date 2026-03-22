import React from 'react';

import Pricing from '@/components/landing/Pricing';

export default function PricingPage() {
  return (
    <div className="py-24 w-full flex justify-center">
      <Pricing showFree={false} />
    </div>
  );
}
