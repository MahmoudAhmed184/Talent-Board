<script setup lang="ts">
import RegisterForm from '@/features/auth/components/RegisterForm.vue'
</script>

<template>
  <div>
    <h1 class="text-page-title text-text-primary">Create a candidate account</h1>
    <p class="mt-2 text-support text-text-muted">
      Apply to approved roles and follow every response in one place.
    </p>

    <div class="mt-8">
      <RegisterForm role="candidate" />
    </div>

    <p class="mt-6 text-support text-text-muted">
      Hiring instead?
      <RouterLink to="/auth/register/employer" class="font-semibold text-accent hover:underline">
        Create an employer account
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
