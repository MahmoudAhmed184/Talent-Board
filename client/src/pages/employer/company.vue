<script setup lang="ts">
/**
 * Company profile and branding.
 *
 * This is what candidates see beside every listing, so the page previews it
 * rather than presenting the fields as abstract settings.
 */
import { onMounted, reactive, ref, watch } from 'vue'
import { http } from '@/http'
import {
  UiAlert,
  UiButton,
  UiCard,
  UiInput,
  UiPageHeader,
  UiSectionHeader,
  UiSkeleton,
  UiTextarea,
} from '@/components/ui'
import CompanySummary from '@/features/jobs/components/CompanySummary.vue'
import LogoUpload from '@/features/employer/components/LogoUpload.vue'
import { isApiValidationError, type ValidationErrorMap } from '@/http'
import { useToast } from '@/composables/useToast'

interface EmployerProfile {
  id: number
  company_name: string | null
  company_summary: string | null
  logo: { original_name?: string | null; path?: string | null } | null
}

const toast = useToast()

const profile = ref<EmployerProfile | null>(null)
const form = reactive({ company_name: '', company_summary: '' })

const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const formError = ref('')
const fieldErrors = ref<ValidationErrorMap>({})

function fieldError(field: string): string {
  return fieldErrors.value[field]?.[0] ?? ''
}

watch(profile, (value) => {
  if (!value) {
    return
  }

  form.company_name = value.company_name ?? ''
  form.company_summary = value.company_summary ?? ''
})

async function load() {
  loading.value = true
  loadError.value = ''

  try {
    const response = await http.get<{ data: EmployerProfile }>('/api/v1/employer/profile')
    profile.value = response.data.data
  } catch {
    loadError.value = 'Your company profile could not be loaded.'
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
    const response = await http.patch<{ data: EmployerProfile }>('/api/v1/employer/profile', {
      company_name: form.company_name.trim(),
      company_summary: form.company_summary.trim() || null,
    })

    profile.value = response.data.data
    toast.success('Your company profile has been updated.', { title: 'Profile saved' })
  } catch (error) {
    // Inputs keep their values so nothing typed is lost.
    if (isApiValidationError(error)) {
      fieldErrors.value = error.errors
      formError.value = 'Please correct the highlighted fields.'
    } else {
      formError.value = 'Your company profile could not be saved. Please try again.'
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
      title="Company profile"
      description="Candidates see this beside every listing you publish."
    />

    <div v-if="loading" class="grid gap-4" role="status" aria-busy="true">
      <span class="sr-only">Loading your company profile</span>
      <UiSkeleton class="h-40" rounded="card" />
      <UiSkeleton class="h-64" rounded="card" />
    </div>

    <UiAlert v-else-if="loadError" tone="danger" title="Profile could not be loaded">
      {{ loadError }}
      <template #actions>
        <UiButton size="sm" variant="secondary" @click="load">Try again</UiButton>
      </template>
    </UiAlert>

    <div v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div class="grid min-w-0 gap-6">
        <UiCard as="section">
          <UiSectionHeader
            title="Branding"
            description="Your logo appears on job cards and listing pages."
          />

          <div class="mt-5">
            <LogoUpload
              :company-name="profile?.company_name"
              :current-logo-url="profile?.logo?.path ?? null"
              @uploaded="load"
              @deleted="load"
            />
          </div>
        </UiCard>

        <form class="grid gap-6" novalidate @submit.prevent="save">
          <UiCard as="section">
            <UiSectionHeader title="Company details" />

            <UiAlert v-if="formError" tone="danger" class="mt-4" title="Your changes were not saved">
              {{ formError }}
            </UiAlert>

            <div class="mt-5 grid gap-5">
              <UiInput
                v-model="form.company_name"
                label="Company name"
                required
                autocomplete="organization"
                :error="fieldError('company_name')"
              />

              <UiTextarea
                v-model="form.company_summary"
                label="About the company"
                optional
                :rows="6"
                :maxlength="1000"
                show-count
                hint="A short description candidates read on your listings."
                :error="fieldError('company_summary')"
              />
            </div>
          </UiCard>

          <div class="flex justify-end">
            <UiButton type="submit" :loading="saving" loading-label="Saving your profile">
              Save changes
            </UiButton>
          </div>
        </form>
      </div>

      <section aria-labelledby="preview-heading">
        <UiSectionHeader
          title="How candidates see you"
          description="A live preview of your public company panel."
        />
        <div class="mt-4">
          <CompanySummary
            variant="panel"
            :name="form.company_name || profile?.company_name"
            :summary="form.company_summary || profile?.company_summary"
            :logo-url="profile?.logo?.path ?? null"
          />
        </div>
      </section>
    </div>
  </div>
</template>
