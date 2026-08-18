import React, { useEffect, useRef } from 'react';
import { Button } from './Button';
import { cn } from '@lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-2xl',
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[rgba(45,42,38,0.4)] backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-surface rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col',
          maxWidth,
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 border-b border-border shrink-0">
            <h2 className="text-base sm:text-xl font-bold text-text-primary">{title}</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-text-secondary hover:text-text-primary hover:bg-surface-variant transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
          </div>
        )}
        <div className="overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
