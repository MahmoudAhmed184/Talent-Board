<script setup lang="ts">
/**
 * Create/edit form for a job listing.
 *
 * Split into labelled sections rather than one long column, so a listing with
 * twelve required fields still reads as a series of small decisions. It is not
 * a wizard: employers frequently edit one field, and a stepper would make that
 * slower.
 *
 * Behaviour that matters:
 *  - Values survive validation failures; nothing typed is ever cleared.
 *  - Required and optional fields are both marked explicitly.
 *  - Submitting is disabled while a request is in flight, so a double click
 *    cannot create two listings.
 *  - Editing an approved listing returns it to moderation, so the form says so
 *    before the employer saves rather than after.
 */
import { computed, onMounted, watch } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import {
  UiAlert,
  UiButton,
  UiCard,
  UiInput,
  UiSectionHeader,
  UiSelect,
  UiTextarea,
} from '@/components/ui'
import { useTaxonomies } from '@/composables/useTaxonomies'
import {
  useEmployerJobForm,
  type EmployerJobFormData,
  type EmployerJobPayload,
} from '@/composables/useEmployerJobForm'
import { EXPERIENCE_LEVEL_OPTIONS, WORK_TYPE_OPTIONS } from '@/lib/status'

const {
  cancelTo = '/employer/jobs',
  initialValues = {},
  mode = 'create',
  submitHandler,
  submitLabel,
  wasApproved = false,
} = defineProps<{
  cancelTo?: string
  initialValues?: Partial<EmployerJobFormData>
  mode?: 'create' | 'edit'
  submitHandler?: (payload: EmployerJobPayload) => Promise<void>
  submitLabel?: string
  /** Drives the "this returns to review" warning when editing a live listing. */
  wasApproved?: boolean
}>()

const emit = defineEmits<{ submit: [payload: EmployerJobPayload] }>()

const form = useEmployerJobForm({
  initialValues,
  onSubmit: async (payload) => {
    if (submitHandler) {
      await submitHandler(payload)
      return
    }

    emit('submit', payload)
  },
})

const { categories, loadTaxonomies, locations } = useTaxonomies()

const categoryOptions = computed(() =>
  categories.value.map((item) => ({ value: String(item.id), label: item.name })),
)
const locationOptions = computed(() =>
  locations.value.map((item) => ({ value: String(item.id), label: item.name })),
)

const resolvedSubmitLabel = computed(
  () => submitLabel ?? (mode === 'edit' ? 'Save changes' : 'Submit for review'),
)

/**
 * The form model stores every field as a string (it is submitted as one), while
 * UiSelect emits `null` for its placeholder option. This proxy translates
 * between the two so neither type has to be loosened, and an empty value shows
 * the placeholder instead of a blank selected option.
 */
type SelectField = 'categoryId' | 'locationId' | 'workType' | 'experienceLevel'

function selectModel(key: SelectField) {
  return computed<string | number | null>({
    get: () => form.values[key] || null,
    set: (value) => {
      form.values[key] = value === null ? '' : String(value)
    },
  })
}

const categoryId = selectModel('categoryId')
const locationId = selectModel('locationId')
const workType = selectModel('workType')
const experienceLevel = selectModel('experienceLevel')

// The parent may resolve `initialValues` asynchronously (edit page fetch).
watch(() => initialValues, (next) => form.setValues(next), { deep: true })

onMounted(() => {
  void loadTaxonomies()
})
</script>

<template>
  <form class="grid gap-6" novalidate @submit.prevent="form.submit()">
    <UiAlert v-if="form.getFormError()" tone="danger" title="This listing was not saved">
      {{ form.getFormError() }}
    </UiAlert>

    <UiAlert
      v-if="mode === 'edit' && wasApproved"
      tone="warning"
      title="Saving returns this listing to review"
    >
      This listing is currently published. Changes go back to an administrator
      for approval, and it stays hidden from candidates until then.
    </UiAlert>

    <UiCard as="section">
      <UiSectionHeader
        title="Role basics"
        description="What the job is called and where it sits in the board."
      />

      <div class="mt-5 grid gap-5">
        <UiInput
          v-model="form.values.title"
          label="Job title"
          required
          placeholder="Senior Vue Engineer"
          hint="The title candidates search for. Avoid internal grade codes."
          :error="form.getFieldError('title') ?? ''"
        />

        <div class="grid gap-5 sm:grid-cols-2">
          <UiSelect
            v-model="categoryId"
            label="Category"
            required
            placeholder="Choose a category"
            :options="categoryOptions"
            :error="form.getFieldError('categoryId') ?? ''"
          />

          <UiSelect
            v-model="experienceLevel"
            label="Experience level"
            required
            placeholder="Choose a level"
            :options="EXPERIENCE_LEVEL_OPTIONS"
            :error="form.getFieldError('experienceLevel') ?? ''"
          />
        </div>
      </div>
    </UiCard>

    <UiCard as="section">
      <UiSectionHeader
        title="Description and responsibilities"
        description="What the person will actually do."
      />

      <div class="mt-5 grid gap-5">
        <UiTextarea
          v-model="form.values.description"
          label="Job description"
          required
          :rows="7"
          hint="Describe the role, the team, and what success looks like."
          :error="form.getFieldError('description') ?? ''"
        />

        <UiTextarea
          v-model="form.values.responsibilities"
          label="Responsibilities"
          optional
          :rows="5"
          hint="One per line works well."
          :error="form.getFieldError('responsibilities') ?? ''"
        />
      </div>
    </UiCard>

    <UiCard as="section">
      <UiSectionHeader
        title="Requirements"
        description="What a candidate needs in order to be considered."
      />

      <div class="mt-5">
        <UiTextarea
          v-model="form.values.qualifications"
          label="Requirements and qualifications"
          optional
          :rows="5"
          hint="Skills, qualifications, and any must-haves."
          :error="form.getFieldError('qualifications') ?? ''"
        />
      </div>
    </UiCard>

    <UiCard as="section">
      <UiSectionHeader
        title="Location and work type"
        description="Where the role is based and how it is worked."
      />

      <div class="mt-5 grid gap-5 sm:grid-cols-2">
        <UiSelect
          v-model="locationId"
          label="Location"
          required
          placeholder="Choose a location"
          :options="locationOptions"
          :error="form.getFieldError('locationId') ?? ''"
        />

        <UiSelect
          v-model="workType"
          label="Work type"
          required
          placeholder="Choose a work type"
          :options="WORK_TYPE_OPTIONS"
          :error="form.getFieldError('workType') ?? ''"
        />
      </div>
    </UiCard>

    <UiCard as="section">
      <UiSectionHeader
        title="Salary and deadline"
        description="Publishing a range gets meaningfully more applications."
      />

      <div class="mt-5 grid gap-5">
        <fieldset class="grid gap-3">
          <legend class="mb-1 text-support font-medium text-text-secondary">
            Salary range (USD)
          </legend>
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <UiInput
              v-model="form.values.salaryMin"
              label="Minimum"
              type="number"
              optional
              :min="0"
              placeholder="60000"
              :error="form.getFieldError('salaryMin') ?? ''"
            />
            <UiInput
              v-model="form.values.salaryMax"
              label="Maximum"
              type="number"
              optional
              :min="0"
              placeholder="90000"
              :error="form.getFieldError('salaryMax') ?? ''"
            />
          </div>
        </fieldset>

        <UiInput
          v-model="form.values.expiresAt"
          label="Application deadline"
          type="date"
          optional
          hint="After this date the listing stops accepting applications."
          :error="form.getFieldError('expiresAt') ?? ''"
        />
      </div>
    </UiCard>

    <UiCard as="section" tone="subtle">
      <UiSectionHeader
        title="Review and submit"
        :description="
          mode === 'edit'
            ? 'Check the details above, then save your changes.'
            : 'Your listing goes to an administrator for approval before candidates can see it.'
        "
      />

      <p class="mt-4 flex items-start gap-2 text-support text-text-muted">
        <AlertTriangle class="mt-0.5 size-4 shrink-0 text-text-faint" aria-hidden="true" />
        Fields marked with an asterisk are required.
      </p>

      <div class="mt-5 flex flex-wrap justify-end gap-3">
        <UiButton :to="cancelTo" variant="secondary" :disabled="form.isSubmitting.value">
          Cancel
        </UiButton>
        <UiButton
          type="submit"
          :loading="form.isSubmitting.value"
          :loading-label="mode === 'edit' ? 'Saving changes' : 'Submitting listing'"
        >
          {{ resolvedSubmitLabel }}
        </UiButton>
      </div>
    </UiCard>
  </form>
</template>
