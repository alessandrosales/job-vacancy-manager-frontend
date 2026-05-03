"use client"

import * as React from "react"
import { FileUpIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { cn } from "~/lib/utils"

const PDF_ACCEPT = ".pdf,application/pdf"

function isPdfFile(file: File): boolean {
  if (file.type === "application/pdf") return true
  return file.name.toLowerCase().endsWith(".pdf")
}

export function ResumeImportPdfDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [rejectMessage, setRejectMessage] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  React.useEffect(() => {
    if (open) return
    setSelectedFile(null)
    setRejectMessage(null)
    setIsDragging(false)
    if (inputRef.current) inputRef.current.value = ""
  }, [open])

  function applyFile(file: File) {
    if (!isPdfFile(file)) {
      setRejectMessage("Please use a PDF file.")
      return
    }
    setRejectMessage(null)
    setSelectedFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (file) applyFile(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) applyFile(file)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null
    if (next && e.currentTarget.contains(next)) return
    setIsDragging(false)
  }

  function openFilePicker() {
    setRejectMessage(null)
    inputRef.current?.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import resume from PDF</DialogTitle>
          <DialogDescription>
            Choose a PDF or drop it on the area below. Parsing and creating a resume from
            the file is not implemented yet—only file selection works for now.
          </DialogDescription>
        </DialogHeader>
        <input
          ref={inputRef}
          type="file"
          accept={PDF_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          onChange={handleInputChange}
        />
        <div className="flex flex-col gap-2">
          <div
            role="button"
            tabIndex={0}
            aria-label="Choose PDF file or drop a PDF here"
            className={cn(
              "border-muted-foreground/35 bg-muted/25 text-muted-foreground flex min-h-[11rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center outline-none transition-colors",
              "hover:border-muted-foreground/55 hover:bg-muted/35",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isDragging && "border-primary/60 bg-primary/5 text-foreground"
            )}
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                openFilePicker()
              }
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            <FileUpIcon className="size-10 shrink-0 opacity-70" />
            <div className="flex max-w-xs flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                Drag and drop a PDF here
              </p>
              <p className="text-xs leading-relaxed">Or click to browse your files.</p>
            </div>
          </div>
          {rejectMessage ? (
            <p className="text-destructive text-sm" role="alert">
              {rejectMessage}
            </p>
          ) : null}
          {selectedFile ? (
            <p className="text-muted-foreground text-sm">
              Selected: <span className="text-foreground font-medium">{selectedFile.name}</span>
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
