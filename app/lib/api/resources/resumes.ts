import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"
import type {
  ApiIndexParams,
  PaginatedEnvelope,
} from "~/lib/api/pagination"
import { toIndexQuery } from "~/lib/api/pagination"
import type { ApiCertification } from "~/lib/api/resources/certifications"
import type { ApiEducation } from "~/lib/api/resources/educations"
import type { ApiSkill } from "~/lib/api/resources/skills"
import type { ResumeDocument } from "~/components/providers/app-data-provider"
import type { ApiWorkExperience } from "~/lib/api/resources/work-experiences"

export interface ApiResume {
  id: string
  user_id: string
  role_id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
  work_experience_ids: string[]
  certification_ids: string[]
  education_ids: string[]
  skill_ids: string[]
}

/** Converte resposta `GET/PATCH/POST resumes` para o documento usado na UI. */
export function apiResumeToResumeDocument(api: ApiResume): ResumeDocument {
  const rawRoleId = api.role_id
  return {
    id: api.id,
    title: api.title,
    description: api.description ?? "",
    updated_at: api.updated_at,
    role_id:
      rawRoleId == null || rawRoleId === ""
        ? ""
        : String(rawRoleId).trim(),
    work_experience_ids: api.work_experience_ids ?? [],
    certification_ids: api.certification_ids ?? [],
    education_ids: api.education_ids ?? [],
    skill_ids: api.skill_ids ?? [],
  }
}

export type ApiResumeWrite = Pick<
  ApiResume,
  "title" | "description" | "role_id"
>

export async function listResumes(params: {
  paginated: false
}): Promise<ApiResume[]>
export async function listResumes(
  params?: { paginated?: true; page?: number; per_page?: number }
): Promise<PaginatedEnvelope<ApiResume>>
export async function listResumes(
  params?: ApiIndexParams
): Promise<PaginatedEnvelope<ApiResume> | ApiResume[]> {
  const query = toIndexQuery(params)
  if (params?.paginated === false) {
    return apiRequestJson<ApiResume[]>({
      path: "resumes",
      method: "GET",
      query,
    })
  }
  return apiRequestJson<PaginatedEnvelope<ApiResume>>({
    path: "resumes",
    method: "GET",
    query,
  })
}

export async function getResume(id: string): Promise<ApiResume> {
  return apiRequestJson<ApiResume>({
    path: `resumes/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

export async function createResume(
  payload: Partial<ApiResumeWrite>
): Promise<ApiResume> {
  return apiRequestJson<ApiResume>({
    path: "resumes",
    method: "POST",
    body: { resume: payload },
  })
}

export async function updateResume(
  id: string,
  payload: Partial<ApiResumeWrite>
): Promise<ApiResume> {
  return apiRequestJson<ApiResume>({
    path: `resumes/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { resume: payload },
  })
}

export async function deleteResume(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `resumes/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}

const resumePath = (resumeId: string, suffix: string) =>
  `resumes/${encodeURIComponent(resumeId)}/${suffix}`

/** Sincroniza experiências profissionais vinculadas ao currículo (ordem = ordem dos ids). */
export async function syncResumeWorkExperiences(
  resumeId: string,
  work_experience_ids: string[]
): Promise<ApiWorkExperience[]> {
  return apiRequestJson<ApiWorkExperience[]>({
    path: resumePath(resumeId, "work-experiences"),
    method: "PATCH",
    body: {
      resume_work_experience: { work_experience_ids },
    },
  })
}

export async function syncResumeCertifications(
  resumeId: string,
  certification_ids: string[]
): Promise<ApiCertification[]> {
  return apiRequestJson<ApiCertification[]>({
    path: resumePath(resumeId, "certifications"),
    method: "PATCH",
    body: {
      resume_certification: { certification_ids },
    },
  })
}

export async function syncResumeEducations(
  resumeId: string,
  education_ids: string[]
): Promise<ApiEducation[]> {
  return apiRequestJson<ApiEducation[]>({
    path: resumePath(resumeId, "educations"),
    method: "PATCH",
    body: {
      resume_education: { education_ids },
    },
  })
}

export async function syncResumeSkills(
  resumeId: string,
  skill_ids: string[]
): Promise<ApiSkill[]> {
  return apiRequestJson<ApiSkill[]>({
    path: resumePath(resumeId, "skills"),
    method: "PATCH",
    body: {
      resume_skill: { skill_ids },
    },
  })
}
