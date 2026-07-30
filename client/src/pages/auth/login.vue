<script setup lang="ts">
/**
 * Sign-in page — one form for all three roles.
 *
 * The API exposes a single `POST /api/v1/auth/login` and derives the role from
 * the account, so there is deliberately no separate administrator sign-in
 * screen: a second form would imply a second credential store that does not
 * exist. Admins are provisioned by seeder and sign in here.
 */
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiAlert, UiButton, UiInput } from '@/components/ui'
import { isApiValidationError, type ValidationErrorMap } from '@/http'
import { useAuth } from '@/features/auth/composables/useAuth'
import { homeForRole } from '@/lib/navigation'

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

const form = reactive({ email: '', password: '' })
const fieldErrors = ref<ValidationErrorMap>({})
const formError = ref('')
const submitting = ref(false)

function fieldError(field: string): string {
  return fieldErrors.value[field]?.[0] ?? ''
}

async function submit() {
  if (submitting.value) {
    return
  }

  formError.value = ''
  fieldErrors.value = {}
  submitting.value = true

  try {
    const session = await login({ email: form.email.trim(), password: form.password })

    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : homeForRole(session.role)

    await router.push(redirect)
  } catch (error) {
    if (isApiValidationError(error)) {
      fieldErrors.value = error.errors
      // Laravel returns the credential mismatch on the email field; surface it
      // at form level too so it is not missed under a single input.
      formError.value = error.errors.email?.[0] ?? 'Please correct the highlighted fields.'
    } else {
      formError.value = 'We could not sign you in. Please check your connection and try again.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-page-title text-text-primary">Sign in</h1>
    <p class="mt-2 text-support text-text-muted">
      Use the account you registered with as a candidate or employer.
    </p>

    <form class="mt-8 grid gap-5" novalidate @submit.prevent="submit">
      <UiAlert v-if="formError" tone="danger" title="Sign-in failed">{{ formError }}</UiAlert>

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
        autocomplete="current-password"
        required
        :error="fieldError('password')"
      />

      <UiButton type="submit" size="lg" block :loading="submitting" loading-label="Signing you in">
        Sign in
      </UiButton>
    </form>

    <p class="mt-6 text-support text-text-muted">
      Do not have an account?
      <RouterLink to="/auth/register" class="font-semibold text-accent hover:underline">
        Create one
      </RouterLink>
    </p>
  </div>
</template>
