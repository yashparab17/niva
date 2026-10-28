"use client";

import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";

type SheetProps = {
  title: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

// Bottom sheet on phones, centred dialog on desktop.
export function Sheet({ title, description, isOpen, onOpenChange, children }: SheetProps) {
  return (
    <ModalOverlay
      isDismissable
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-[2px] data-entering:animate-in data-entering:fade-in data-exiting:animate-out data-exiting:fade-out md:items-center md:p-6"
    >
      <Modal className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-6 shadow-xl data-entering:animate-in data-entering:slide-in-from-bottom-8 data-exiting:animate-out data-exiting:slide-out-to-bottom-8 md:rounded-3xl">
        <Dialog className="flex flex-col gap-4 outline-none">
          <div>
            <Heading slot="title" className="font-heading text-2xl font-semibold">
              {title}
            </Heading>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {children}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
