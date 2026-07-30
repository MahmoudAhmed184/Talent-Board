/**
 * The single source of truth for how backend states are presented.
 *
 * Every status label, tone, icon, and helper text in the app resolves through
 * this module. Nothing may map a status to a colour inline — that is how
 * "accepted" ends up green in one view and blue in another.
 *
 * The state values themselves are owned by the API and must not be invented
 * here:
 *  - Application statuses come from `server/app/Enums/ApplicationStatus.php`.
 *  - Job moderation statuses come from the `approval_status` column
 *    (`pending | approved | rejected`).
 *
 * Colour never carries meaning on its own: each descriptor pairs a tone with a
 * distinct label and icon so the state survives greyscale and screen readers.
 */
import {
  Ban,
  CalendarX2,
  CheckCircle2,
  CircleDashed,
  Clock,
  Eye,
  Send,
  XCircle,
  type LucideIcon,
} from 'lucide-vue-next'

/** Visual tones available to badges and status surfaces. */
export type Tone = 'neutral' | 'accent' | 'info' | 'success' | 'warning' | 'danger'

export interface StatusDescriptor<TValue extends string> {
  readonly value: TValue
  /** Short label shown inside the badge. */
  readonly label: string
  readonly tone: Tone
  readonly icon: LucideIcon
  /** One sentence explaining what the state means for the person reading it. */
  readonly description: string
}

/* ------------------------------------------------------------------ *
 * Application status
 * ------------------------------------------------------------------ */

export const APPLICATION_STATUSES = [
  'submitted',
  'under_review',
  'accepted',
  'rejected',
  'cancelled',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

const APPLICATION_STATUS_MAP: Record<ApplicationStatus, StatusDescriptor<ApplicationStatus>> = {
  submitted: {
    value: 'submitted',
    label: 'Submitted',
    tone: 'info',
    icon: Send,
    description: 'Your application has been sent to the employer.',
  },
  under_review: {
    value: 'under_review',
    label: 'Under review',
    tone: 'warning',
    icon: Eye,
    description: 'The employer is currently reviewing this application.',
  },
  accepted: {
    value: 'accepted',
    label: 'Accepted',
    tone: 'success',
    icon: CheckCircle2,
    description: 'The employer accepted this application.',
  },
  rejected: {
    value: 'rejected',
    label: 'Not selected',
    tone: 'danger',
    icon: XCircle,
    description: 'The employer decided not to move forward with this application.',
  },
  cancelled: {
    value: 'cancelled',
    label: 'Cancelled',
    tone: 'neutral',
    icon: Ban,
    description: 'This application was withdrawn by the candidate.',
  },
}

const UNKNOWN_APPLICATION_STATUS: StatusDescriptor<ApplicationStatus> = {
  value: 'submitted',
  label: 'Unknown',
  tone: 'neutral',
  icon: CircleDashed,
  description: 'This application status is not recognised by the current app version.',
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value)
}

export function applicationStatus(value: string): StatusDescriptor<ApplicationStatus> {
  return isApplicationStatus(value) ? APPLICATION_STATUS_MAP[value] : UNKNOWN_APPLICATION_STATUS
}

/** Statuses a candidate is still allowed to withdraw, per the D4 contract. */
const CANCELLABLE_STATUSES: readonly ApplicationStatus[] = ['submitted', 'under_review']

export function isCancellable(value: string): boolean {
  return isApplicationStatus(value) && CANCELLABLE_STATUSES.includes(value)
}

/** Statuses an employer may still act on. */
export function isDecidable(value: string): boolean {
  return isApplicationStatus(value) && CANCELLABLE_STATUSES.includes(value)
}

/** Filter options for candidate and employer application lists. */
export const APPLICATION_STATUS_FILTERS = APPLICATION_STATUSES.map((value) => ({
  value,
  label: APPLICATION_STATUS_MAP[value].label,
}))

/* ------------------------------------------------------------------ *
 * Job moderation status
 * ------------------------------------------------------------------ */

export const JOB_STATUSES = ['pending', 'approved', 'rejected'] as const

export type JobStatus = (typeof JOB_STATUSES)[number]

/**
 * `expired` is not a stored moderation state — it is derived from an approved
 * listing whose application deadline has passed. It is modelled here so the UI
 * can present it consistently without pretending the API returns it.
 */
export type JobDisplayStatus = JobStatus | 'expired'

const JOB_STATUS_MAP: Record<JobDisplayStatus, StatusDescriptor<JobDisplayStatus>> = {
  pending: {
    value: 'pending',
    label: 'Pending review',
    tone: 'warning',
    icon: Clock,
    description: 'Waiting for an administrator to approve this listing. It is not public yet.',
  },
  approved: {
    value: 'approved',
    label: 'Published',
    tone: 'success',
    icon: CheckCircle2,
    description: 'This listing is approved and visible to candidates.',
  },
  rejected: {
    value: 'rejected',
    label: 'Rejected',
    tone: 'danger',
    icon: XCircle,
    description: 'An administrator rejected this listing. It is not visible to candidates.',
  },
  expired: {
    value: 'expired',
    label: 'Expired',
    tone: 'neutral',
    icon: CalendarX2,
    description: 'The application deadline has passed, so this listing no longer accepts applications.',
  },
}

const UNKNOWN_JOB_STATUS: StatusDescriptor<JobDisplayStatus> = {
  value: 'pending',
  label: 'Unknown',
  tone: 'neutral',
  icon: CircleDashed,
  description: 'This listing status is not recognised by the current app version.',
}

export function isJobStatus(value: string): value is JobStatus {
  return (JOB_STATUSES as readonly string[]).includes(value)
}

export function jobStatus(value: string): StatusDescriptor<JobDisplayStatus> {
  return value in JOB_STATUS_MAP
    ? JOB_STATUS_MAP[value as JobDisplayStatus]
    : UNKNOWN_JOB_STATUS
}

/** True once an approved listing's deadline has passed. */
export function hasExpired(expiresAt: string | null | undefined, now = new Date()): boolean {
  if (!expiresAt) {
    return false
  }

  const deadline = new Date(expiresAt)

  return !Number.isNaN(deadline.getTime()) && deadline.getTime() < now.getTime()
}

/**
 * Resolves the status a listing should *display*, folding the derived expiry
 * state into the stored moderation state.
 */
export function jobDisplayStatus(
  approvalStatus: string,
  expiresAt?: string | null,
  now = new Date(),
): StatusDescriptor<JobDisplayStatus> {
  if (approvalStatus === 'approved' && hasExpired(expiresAt, now)) {
    return JOB_STATUS_MAP.expired
  }

  return jobStatus(approvalStatus)
}

export const JOB_STATUS_FILTERS = JOB_STATUSES.map((value) => ({
  value,
  label: JOB_STATUS_MAP[value].label,
}))

/* ------------------------------------------------------------------ *
 * Job taxonomy presentation
 * ------------------------------------------------------------------ */

export const WORK_TYPES = ['remote', 'on-site', 'hybrid'] as const
export type WorkType = (typeof WORK_TYPES)[number]

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  remote: 'Remote',
  'on-site': 'On-site',
  hybrid: 'Hybrid',
}

export const WORK_TYPE_OPTIONS = WORK_TYPES.map((value) => ({
  value,
  label: WORK_TYPE_LABELS[value],
}))

export const EXPERIENCE_LEVELS = ['junior', 'mid', 'senior', 'lead'] as const
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
  lead: 'Lead',
}

export const EXPERIENCE_LEVEL_OPTIONS = EXPERIENCE_LEVELS.map((value) => ({
  value,
  label: EXPERIENCE_LEVEL_LABELS[value],
}))

export function workTypeLabel(value?: string | null): string {
  if (!value) {
    return 'Not specified'
  }

  return WORK_TYPE_LABELS[value as WorkType] ?? value
}

export function experienceLevelLabel(value?: string | null): string {
  if (!value) {
    return 'Not specified'
  }

  return EXPERIENCE_LEVEL_LABELS[value as ExperienceLevel] ?? value
}
