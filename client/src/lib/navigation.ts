/**
 * Role-based navigation map.
 *
 * One definition drives the desktop sidebar, the mobile drawer, and the account
 * menu, so a route can never appear in one and be missing from another.
 *
 * Each role gets only the destinations its API surface actually supports —
 * the three workspaces look related but do not pretend to have the same
 * responsibilities.
 */
import {
  Building2,
  ClipboardList,
  FileText,
  Gauge,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Search,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from 'lucide-vue-next'
import type { UserRole } from '@/features/auth/types'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /**
   * Matches nested routes as active, e.g. `/employer/jobs` stays highlighted on
   * `/employer/jobs/12/edit`. Index routes set this false so they do not claim
   * every sibling.
   */
  matchNested?: boolean
}

export const CANDIDATE_NAV: readonly NavItem[] = [
  { label: 'Overview', to: '/candidate', icon: LayoutDashboard },
  { label: 'Find jobs', to: '/candidate/jobs', icon: Search },
  { label: 'My applications', to: '/candidate/applications', icon: ClipboardList, matchNested: true },
  { label: 'Resumes', to: '/candidate/resumes', icon: FileText },
  { label: 'Profile', to: '/candidate/profile', icon: User },
]

export const EMPLOYER_NAV: readonly NavItem[] = [
  { label: 'Overview', to: '/employer', icon: LayoutDashboard },
  { label: 'Job listings', to: '/employer/jobs', icon: ListChecks, matchNested: true },
  { label: 'Post a job', to: '/employer/jobs/create', icon: PlusCircle },
  { label: 'Applications', to: '/employer/applications', icon: Users, matchNested: true },
  { label: 'Company profile', to: '/employer/company', icon: Building2 },
]

export const ADMIN_NAV: readonly NavItem[] = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard },
  { label: 'Moderation queue', to: '/admin/jobs', icon: ShieldCheck, matchNested: true },
  { label: 'Platform activity', to: '/admin/activity', icon: Gauge },
]

export function navigationForRole(role: UserRole | null): readonly NavItem[] {
  if (role === 'candidate') return CANDIDATE_NAV
  if (role === 'employer') return EMPLOYER_NAV
  if (role === 'admin') return ADMIN_NAV

  return []
}

/** Where a signed-in user lands after login, and where the logo links to. */
export function homeForRole(role: UserRole | null): string {
  if (role === 'candidate') return '/candidate'
  if (role === 'employer') return '/employer'
  if (role === 'admin') return '/admin'

  return '/'
}

/** Human label for the role, used in the account menu and shell headers. */
export const ROLE_LABELS: Record<UserRole, string> = {
  candidate: 'Candidate',
  employer: 'Employer',
  admin: 'Administrator',
}

/**
 * True when `path` should mark `item` as the active destination.
 *
 * Exact match by default so an index route does not highlight for every child;
 * `matchNested` opts a section into prefix matching.
 */
export function isNavItemActive(item: NavItem, path: string): boolean {
  if (path === item.to) {
    return true
  }

  return Boolean(item.matchNested) && path.startsWith(`${item.to}/`)
}
