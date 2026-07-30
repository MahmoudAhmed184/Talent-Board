<route lang="json">
{
  "meta": {
    "layout": "standalone",
    "requiresAuth": true,
    "role": "employer"
  }
}
</route>

<script setup lang="ts">
/**
 * Employer workspace frame.
 */
import WorkspaceShell from '@/layouts/WorkspaceShell.vue'
</script>

<template>
  <WorkspaceShell />
</template>
