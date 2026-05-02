/**
 * Props comuns dos diálogos “criar relação” (empresa, cargo, status) usados em formulários.
 */
export type QuickAddRelationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Chamado após criar o registro, com o novo id (select pode usar como value). */
  onAdded: (id: string) => void
  /** Quando true, persiste via API em vez do app-data local. */
  persistViaApi?: boolean
  /** Após sucesso na API (ex.: refetch das listas no formulário pai). */
  onPersistedViaApi?: () => void | Promise<void>
}
