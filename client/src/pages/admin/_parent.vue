<route lang="json">
{
  "meta": {
    "layout": "standalone",
    "requiresAuth": true,
    "role": "admin"
  }
}
</route>

<script setup lang="ts">
/**
 * Admin moderation workspace frame.
 */
import WorkspaceShell from '@/layouts/WorkspaceShell.vue'
</script>

<template>
  <WorkspaceShell />
</template>
