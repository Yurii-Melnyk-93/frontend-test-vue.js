<template>
  <Teleport to="body">
    <div class="toasts" role="status" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.kind}`]"
          @click="dismiss(toast.id)"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<style scoped lang="scss">
.toasts {
  position: fixed;
  right: var(--space-5);
  top: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  z-index: 1000;
}

.toast {
  min-width: 220px;
  max-width: 360px;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  color: #fff;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  font-weight: 500;

  &--success {
    background: var(--color-success);
  }
  &--error {
    background: var(--color-danger);
  }
  &--info {
    background: var(--color-primary);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
