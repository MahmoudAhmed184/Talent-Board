<script setup lang="ts">
/**
 * Registration form, shared by the candidate and employer sign-up routes.
 *
 * One component with a fixed `role` prop rather than two near-identical forms:
 * the fields differ only by the employer's company name, and duplicating the
 * validation and error mapping is how the two would drift.
 *
 * Field values survive a failed submit — the form is never cleared on error,
 * only the password fields are left for the user to decide about.
 */
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiAlert, UiButton, UiInput } from '@/components/ui'
import { isApiValidationError, type ValidationErrorMap } from '@/http'
import { useAuth } from '../composables/useAuth'
import { homeForRole } from '@/lib/navigation'
import type { UserRole } from '../types'

const { role } = defineProps<{ role: Exclude<UserRole, 'admin'> }>()

const route = useRoute()
const router = useRouter()
const { register } = useAuth()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  company_name: '',
})

const fieldErrors = ref<ValidationErrorMap>({})
const formError = ref('')
const submitting = ref(false)

const isEmployer = computed(() => role === 'employer')

function fieldError(field: string): string {
  return fieldErrors.value[field]?.[0] ?? ''
}

/** Local checks that would otherwise cost a round trip to discover. */
function validateLocally(): boolean {
  const errors: ValidationErrorMap = {}

  if (!form.name.trim()) errors.name = ['Enter your name.']
  if (!form.email.trim()) errors.email = ['Enter your email address.']
  if (isEmployer.value && !form.company_name.trim()) {
    errors.company_name = ['Enter your company name.']
  }
  if (form.password.length < 8) {
    errors.password = ['Use at least 8 characters.']
  }
  if (form.password !== form.password_confirmation) {
    errors.password_confirmation = ['Both passwords must match.']
  }

  fieldErrors.value = errors

  return Object.keys(errors).length === 0
}

async function submit() {
  if (submitting.value || !validateLocally()) {
    return
  }

  formError.value = ''
  submitting.value = true

  try {
    const session = await register({
      role,
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      password_confirmation: form.password_confirmation,
      ...(isEmployer.value ? { company_name: form.company_name.trim() } : {}),
    })

    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : homeForRole(session.role)

    await router.push(redirect)
  } catch (error) {
    if (isApiValidationError(error)) {
      fieldErrors.value = error.errors
      formError.value = 'Please correct the highlighted fields.'
    } else {
      formError.value = 'We could not create your account. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="grid gap-5" novalidate @submit.prevent="submit">
    <UiAlert v-if="formError" tone="danger" title="Registration failed">
      {{ formError }}
    </UiAlert>

    <UiInput
      v-model="form.name"
      label="Full name"
      autocomplete="name"
      required
      :error="fieldError('name')"
    />

    <UiInput
      v-if="isEmployer"
      v-model="form.company_name"
      label="Company name"
      autocomplete="organization"
      required
      hint="Shown to candidates on every listing you publish."
      :error="fieldError('company_name')"
    />

    <UiInput
      v-model="form.email"
      label="Email address"
      type="email"
      autocomplete="email"
      inputmode="email"
      required
      :error="fieldError('email')"
    />

    <UiInput
      v-model="form.password"
      label="Password"
      type="password"
      autocomplete="new-password"
      required
      hint="At least 8 characters."
      :error="fieldError('password')"
    />

    <UiInput
      v-model="form.password_confirmation"
      label="Confirm password"
      type="password"
      autocomplete="new-password"
      required
      :error="fieldError('password_confirmation')"
    />

    <UiButton type="submit" size="lg" block :loading="submitting" loading-label="Creating your account">
      Create {{ isEmployer ? 'employer' : 'candidate' }} account
    </UiButton>
  </form>
</template>
