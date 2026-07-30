import { onMounted, ref } from 'vue'
import { useEcho, type ApplicationStatusChangedPayload } from '@/composables/useEcho'
import { useAuthStore } from '@/features/auth/stores/useAuthStore'
import type { RealtimeState } from '@/components/RealtimeStatusIndicator.vue'

/**
 * Subscribes to the Reverb channel carrying application status changes.
 *
 * Channel names and the event alias mirror `ApplicationStatusBroadcast`:
 *   private `application-status.candidate.{id}` / `.employer.{id}`
 *   event alias `ApplicationStatusChanged`
 *
 * Reports its own connection state so the UI can tell the truth about whether
 * it is actually live. If the socket cannot be established the caller shows a
 * refresh affordance instead of a green dot over stale data.
 */
export function useApplicationStatusStream(
  onStatusChange: (payload: ApplicationStatusChangedPayload) => void,
) {
  const authStore = useAuthStore()
  const { prepareRealtimeAuth, subscribePrivate } = useEcho()

  const state = ref<RealtimeState>('connecting')

  async function connect() {
    const userId = authStore.user?.id
    const role = authStore.role

    if (!userId || (role !== 'candidate' && role !== 'employer')) {
      state.value = 'unavailable'
      return
    }

    state.value = 'connecting'

    try {
      await prepareRealtimeAuth()

      subscribePrivate<ApplicationStatusChangedPayload>(
        `application-status.${role}.${userId}`,
        '.ApplicationStatusChanged',
        (payload) => {
          state.value = 'connected'
          onStatusChange(payload)
        },
      )

      state.value = 'connected'
    } catch {
      // Reverb may simply not be running in this environment. That is a
      // legitimate state, not an error to shout about — the surrounding UI
      // falls back to manual refresh.
      state.value = 'unavailable'
    }
  }

  onMounted(connect)

  return { reconnect: connect, state }
}
