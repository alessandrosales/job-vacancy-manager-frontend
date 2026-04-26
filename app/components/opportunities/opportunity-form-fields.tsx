import { InterestLevelStarPicker } from "~/components/interest-level-star-picker"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import type {
  InterestLevel,
  OpportunityStatus,
  OpportunityStatusDefinition,
} from "~/lib/labels"

export type OpportunityFormFieldsProps = {
  /** Prefixo para `id` / `htmlFor` únicos (página, dialog, etc.) */
  idPrefix: string
  company: string
  onCompanyChange: (v: string) => void
  role: string
  onRoleChange: (v: string) => void
  description: string
  onDescriptionChange: (v: string) => void
  url: string
  onUrlChange: (v: string) => void
  status: OpportunityStatus
  onStatusChange: (v: OpportunityStatus) => void
  interestLevel: InterestLevel
  onInterestLevelChange: (v: InterestLevel) => void
  opportunityStatuses: readonly OpportunityStatusDefinition[]
}

/**
 * Campos do formulário de oportunidade — mesmos do registro em página inteira.
 */
export function OpportunityFormFields({
  idPrefix,
  company,
  onCompanyChange,
  role,
  onRoleChange,
  description,
  onDescriptionChange,
  url,
  onUrlChange,
  status,
  onStatusChange,
  interestLevel,
  onInterestLevelChange,
  opportunityStatuses,
}: OpportunityFormFieldsProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-company`}>Company</FieldLabel>
        <Input
          id={`${idPrefix}-company`}
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-role`}>Role</FieldLabel>
        <Input
          id={`${idPrefix}-role`}
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-desc`}>Description</FieldLabel>
        <Textarea
          id={`${idPrefix}-desc`}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          required
          rows={4}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-url`}>URL</FieldLabel>
        <Input
          id={`${idPrefix}-url`}
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://"
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-status`}>Status</FieldLabel>
        <Select
          value={status}
          onValueChange={(v) => onStatusChange(v as OpportunityStatus)}
        >
          <SelectTrigger id={`${idPrefix}-status`} className="w-full min-w-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {opportunityStatuses.map((st) => (
                <SelectItem key={st.id} value={st.id}>
                  {st.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel>Interest level</FieldLabel>
        <InterestLevelStarPicker
          value={interestLevel}
          onChange={onInterestLevelChange}
        />
      </Field>
    </FieldGroup>
  )
}
