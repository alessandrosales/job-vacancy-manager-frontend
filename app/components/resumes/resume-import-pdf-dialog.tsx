"use client"

import * as React from "react"
import { Link } from "react-router"
import { FileUpIcon, Loader2Icon } from "lucide-react"

import type { Role } from "~/components/providers/app-data-provider"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ApiError } from "~/lib/api/errors"
import { importResumeFromPdf, type ApiResume } from "~/lib/api/resources/resumes"
import { cn } from "~/lib/utils"

const PDF_ACCEPT = ".pdf,application/pdf"

function isPdfFile(file: File): boolean {
  if (file.type === "application/pdf") return true
  return file.name.toLowerCase().endsWith(".pdf")
}

function pdfImportErrorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const fileErr = err.fieldErrors.file?.[0]
    if (fileErr) return fileErr
    const roleErr = err.fieldErrors.role_id?.[0]
    if (roleErr) return roleErr
    const first = Object.values(err.fieldErrors).flat()[0]
    if (first) return first
  }
  return fallback
}

export function ResumeImportPdfDialog({
  open,
  onOpenChange,
  roles,
  onImported,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: readonly Role[]
  onImported: (resume: ApiResume) => void | Promise<void>
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [roleId, setRoleId] = React.useState("")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [rejectMessage, setRejectMessage] = React.useState<string | null>(null)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setSelectedFile(null)
    setRejectMessage(null)
    setSubmitError(null)
    setIsDragging(false)
    setSubmitting(false)
    setRoleId("")
    if (inputRef.current) inputRef.current.value = ""
  }, [open])

  React.useEffect(() => {
    if (!open) return
    if (roles.length === 1) setRoleId(roles[0].id)
  }, [open, roles])

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
    if (submitting) return
    const file = e.dataTransfer.files?.[0]
    if (file) applyFile(file)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!submitting) setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null
    if (next && e.currentTarget.contains(next)) return
    setIsDragging(false)
  }

  function openFilePicker() {
    if (submitting) return
    setRejectMessage(null)
    inputRef.current?.click()
  }

  async function handleImport() {
    if (!selectedFile || !roleId.trim()) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const resume = await importResumeFromPdf({
        file: selectedFile,
        role_id: roleId.trim(),
      })
      await onImported(resume)
      onOpenChange(false)
    } catch (err) {
      setSubmitError(pdfImportErrorText(err, "Could not import the PDF."))
    } finally {
      setSubmitting(false)
    }
  }

  const hasRoles = roles.length > 0
  const canImport = Boolean(selectedFile && roleId.trim() && hasRoles && !submitting)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import resume from PDF</DialogTitle>
          <DialogDescription>
            Choose the target role, then pick or drop a PDF. The server extracts structured
            data (experience with employers as companies, education, certifications, skills,
            languages, profile links such as LinkedIn or GitHub, and additional roles when
            listed on the CV) and creates a new resume linked to the role you
            selected.
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
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="resume-import-role">Role</FieldLabel>
            {hasRoles ? (
              <Select
                value={roleId === "" ? undefined : roleId}
                onValueChange={setRoleId}
                disabled={submitting}
              >
                <SelectTrigger id="resume-import-role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground text-sm">
                No roles yet.{" "}
                <Link to="/roles/role" className="text-primary underline-offset-4 hover:underline">
                  Create a role
                </Link>{" "}
                first, then try importing again.
              </p>
            )}
            <FieldDescription>
              Imported content is attached to this role, like a manually created resume.
            </FieldDescription>
          </Field>

          <div className="flex flex-col gap-2">
            <FieldLabel className="text-foreground">PDF file</FieldLabel>
            <div
              role="button"
              tabIndex={submitting ? -1 : 0}
              aria-label="Choose PDF file or drop a PDF here"
              aria-disabled={submitting}
              className={cn(
                "border-muted-foreground/35 bg-muted/25 text-muted-foreground flex min-h-[11rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center outline-none transition-colors",
                !submitting &&
                  "hover:border-muted-foreground/55 hover:bg-muted/35 cursor-pointer",
                !submitting &&
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                submitting && "cursor-not-allowed opacity-60",
                isDragging && !submitting && "border-primary/60 bg-primary/5 text-foreground"
              )}
              onClick={openFilePicker}
              onKeyDown={(e) => {
                if (submitting) return
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
                Selected:{" "}
                <span className="text-foreground font-medium">{selectedFile.name}</span>
              </p>
            ) : null}
          </div>

          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}
        </FieldGroup>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Close
          </Button>
          <Button type="button" disabled={!canImport} onClick={() => void handleImport()}>
            {submitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" data-icon="inline-start" />
                Importing…
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
