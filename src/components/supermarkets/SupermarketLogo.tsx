import { useState } from 'react';
import { cn } from '@lib/utils';
import { getImageUrl, getInitials } from '@lib/formatters';

interface SupermarketLogoProps {
  logoPath?: string | null;
  name: string;
  className?: string;
}

export function SupermarketLogo({
  logoPath,
  name,
  className = 'w-3 h-3 sm:w-14 sm:h-14',
}: SupermarketLogoProps) {
  const [imgError, setImgError] = useState(false);
  const fullUrl = getImageUrl(logoPath);

  if (fullUrl && !imgError) {
    return (
      <div
        className={cn(
          'rounded-full overflow-hidden bg-white border-2 border-[#EAE5D9] shrink-0 shadow-xs flex items-center justify-center p-0',
          className
        )}
      >
        <img
          src={fullUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-white border-2 border-[#EAE5D9] text-[#1A2E26] font-black text-xl flex items-center justify-center shrink-0 shadow-xs',
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
