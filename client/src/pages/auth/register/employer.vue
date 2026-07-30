<script setup lang="ts">
import { UiAlert } from '@/components/ui'
import RegisterForm from '@/features/auth/components/RegisterForm.vue'
</script>

<template>
  <div>
    <h1 class="text-page-title text-text-primary">Create an employer account</h1>
    <p class="mt-2 text-support text-text-muted">
      Publish roles, review applicants, and make decisions in one workspace.
    </p>

    <div class="mt-6">
      <!-- Set the expectation before they post, not after they wonder why the
           listing is not public. -->
      <UiAlert tone="info" title="Listings are reviewed before publication">
        Every job you post is checked by an administrator before candidates can
        see it. You will see its status in your workspace.
      </UiAlert>
    </div>

    <div class="mt-6">
      <RegisterForm role="employer" />
    </div>

    <p class="mt-6 text-support text-text-muted">
      Looking for work instead?
      <RouterLink to="/auth/register/candidate" class="font-semibold text-accent hover:underline">
        Create a candidate account
      </RouterLink>
    </p>
    <p class="mt-2 text-support text-text-muted">
      Already registered?
      <RouterLink to="/auth/login" class="font-semibold text-accent hover:underline">
        Sign in
      </RouterLink>
    </p>
  </div>
</template>
