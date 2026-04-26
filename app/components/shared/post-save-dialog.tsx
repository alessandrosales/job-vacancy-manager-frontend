import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

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
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onGoToList() }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{entityLabel} saved</DialogTitle>
          <DialogDescription>
            What would you like to do next?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onGoToList}>
            Back to list
          </Button>
          <Button onClick={onAddAnother}>
            Add another
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
