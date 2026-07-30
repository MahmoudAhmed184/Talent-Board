<script setup lang="ts">
/**
 * Candidate profile: summary, contact details, and skills.
 *
 * One form, sectioned rather than stepped — this is short enough that a wizard
 * would add ceremony without reducing effort.
 *
 * Name and email come from the user account and are not editable through the
 * profile endpoint (`PATCH /candidate/profile` accepts summary, location_text,
 * phone, skills, default_resume_id), so they are shown read-only instead of as
 * inputs that would silently discard edits.
 */
import { onMounted, reactive, ref, watch } from 'vue'
import { Mail, User } from 'lucide-vue-next'
import {
  UiAlert,
  UiButton,
  UiCard,
  UiInput,
  UiPageHeader,
  UiSectionHeader,
  UiSkeleton,
  UiTagInput,
  UiTextarea,
} from '@/components/ui'
import { useCandidateProfileStore } from '@/features/candidate/stores/useCandidateProfileStore'
import { isApiValidationError, type ValidationErrorMap } from '@/http'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const store = useCandidateProfileStore()

const form = reactive({
  summary: '',
  location_text: '',
  phone: '',
  skills: [] as string[],
})

const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const fieldErrors = ref<ValidationErrorMap>({})

function fieldError(field: string): string {
  return fieldErrors.value[field]?.[0] ?? ''
}

/** Refill the form whenever the store's profile is replaced. */
watch(
  () => store.profile,
  (profile) => {
    if (!profile) {
      return
    }

    form.summary = profile.summary ?? ''
    form.location_text = profile.location_text ?? ''
    form.phone = profile.phone ?? ''
    form.skills = [...(profile.skills ?? [])]
  },
  { immediate: true },
)

async function load() {
  loading.value = true
  loadError.value = ''

  try {
    await store.loadProfile()
  } catch {
    loadError.value = 'Your profile could not be loaded.'
  } finally {
    loading.value = false
  }
}

async function save() {
  if (saving.value) {
    return
  }

  saving.value = true
  formError.value = ''
  fieldErrors.value = {}

  try {
    await store.saveProfile({
      summary: form.summary.trim() || null,
      location_text: form.location_text.trim() || null,
      phone: form.phone.trim() || null,
      skills: form.skills,
    })

    toast.success('Your profile has been updated.', { title: 'Profile saved' })
  } catch (error) {
    // Values are deliberately left in place so nothing typed is lost.
    if (isApiValidationError(error)) {
      fieldErrors.value = error.errors
      formError.value = 'Please correct the highlighted fields.'
    } else {
      formError.value = 'Your profile could not be saved. Please try again.'
    }
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="grid gap-6">
    <UiPageHeader
      title="My profile"
      description="This is what employers see alongside your applications."
    />

    <div v-if="loading" class="grid gap-4" role="status" aria-busy="true">
      <span class="sr-only">Loading your profile</span>
      <UiSkeleton class="h-32" rounded="card" />
      <UiSkeleton class="h-64" rounded="card" />
    </div>

    <UiAlert v-else-if="loadError" tone="danger" title="Profile could not be loaded">
      {{ loadError }}
      <template #actions>
        <UiButton size="sm" variant="secondary" @click="load">Try again</UiButton>
      </template>
    </UiAlert>

    <form v-else class="grid gap-6" novalidate @submit.prevent="save">
      <UiAlert v-if="formError" tone="danger" title="Your profile was not saved">
        {{ formError }}
      </UiAlert>

      <!-- Account identity: owned by the auth record, not this endpoint. -->
      <UiCard as="section">
        <UiSectionHeader
          title="Account"
          description="Managed with your sign-in details and shown to employers when you apply."
        />

        <dl class="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt class="text-meta font-semibold uppercase tracking-wide text-text-muted">Name</dt>
            <dd class="mt-1 flex items-center gap-2 text-support text-text-primary">
              <User class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
              {{ store.profile?.name || 'Not set' }}
            </dd>
          </div>
          <div>
            <dt class="text-meta font-semibold uppercase tracking-wide text-text-muted">Email</dt>
            <dd class="mt-1 flex items-center gap-2 text-support text-text-primary">
              <Mail class="size-4 shrink-0 text-text-faint" aria-hidden="true" />
              {{ store.profile?.email || 'Not set' }}
            </dd>
          </div>
        </dl>
      </UiCard>

      <UiCard as="section">
        <UiSectionHeader title="About you" />

        <div class="mt-4 grid gap-5">
          <UiTextarea
            v-model="form.summary"
            label="Professional summary"
            optional
            :rows="5"
            :maxlength="1000"
            show-count
            hint="A short introduction employers read first."
            placeholder="Front-end engineer with five years building Vue applications…"
            :error="fieldError('summary')"
          />

          <UiInput
            v-model="form.location_text"
            label="Location"
            optional
            placeholder="Cairo, Egypt"
            hint="Where you are based, or where you want to work."
            :error="fieldError('location_text')"
          />
        </div>
      </UiCard>

      <UiCard as="section">
        <UiSectionHeader
          title="Contact details"
          description="Sent to the employer with every application you submit."
        />

        <div class="mt-4">
          <UiInput
            v-model="form.phone"
            label="Phone number"
            type="tel"
            optional
            inputmode="tel"
            autocomplete="tel"
            placeholder="+20 100 000 0000"
            :error="fieldError('phone')"
          />
        </div>
      </UiCard>

      <UiCard as="section">
        <UiSectionHeader title="Skills" />

        <div class="mt-4">
          <UiTagInput
            v-model="form.skills"
            label="Your skills"
            :error="fieldError('skills')"
            placeholder="e.g. Vue, TypeScript, Laravel"
          />
        </div>
      </UiCard>

      <div class="flex justify-end gap-3">
        <UiButton type="submit" :loading="saving" loading-label="Saving your profile">
          Save changes
        </UiButton>
      </div>
    </form>
  </div>
</template>
