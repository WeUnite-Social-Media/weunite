import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { TermsOfUseArticle } from "@/features/legal/components/TermsOfUseArticle";
import { TERMS_OF_USE_LAST_UPDATED } from "@/features/legal/constants/termsOfUse";

type TermsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Termos de Uso</DialogTitle>
          <DialogDescription>
            Última atualização: {TERMS_OF_USE_LAST_UPDATED}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <TermsOfUseArticle />
        </div>
      </DialogContent>
    </Dialog>
  );
}
