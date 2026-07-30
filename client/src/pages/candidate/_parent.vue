<route lang="json">
{
  "meta": {
    "layout": "standalone",
    "requiresAuth": true,
    "role": "candidate"
  }
}
</route>

<script setup lang="ts">
/**
 * Candidate workspace frame. Navigation contents come from
 * `src/lib/navigation.ts`; the frame itself is shared with employers and admins.
 */
import WorkspaceShell from '@/layouts/WorkspaceShell.vue'
</script>

<template>
  <WorkspaceShell />
</template>
