"use client"

import { useTranslation } from "react-i18next"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { pagesI18nNs } from "~/lib/i18n/config"

interface PostSaveDialogProps {
  open: boolean
  entityLabel: string
  onGoToList: () => void
  onAddAnother: () => void
}

export function PostSaveDialog({
  open,
  entityLabel,
  onGoToList,
  onAddAnother,
}: PostSaveDialogProps) {
  const { t } = useTranslation(pagesI18nNs)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onGoToList() }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {t("post_save.title", { entity: entityLabel })}
          </DialogTitle>
          <DialogDescription>
            {t("post_save.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onGoToList}>
            {t("post_save.back_to_list")}
          </Button>
          <Button type="button" onClick={onAddAnother}>
            {t("post_save.add_another")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
