<template>
  <button :type="type" :disabled="disabled" :class="['btn', `btn--${variant}`]">
    <slot />
  </button>
</template>

<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

withDefaults(
  defineProps<{
    variant?: Variant
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
  },
)
</script>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &--primary {
    background: var(--color-primary);
    color: #fff;
    &:hover:not(:disabled) {
      background: var(--color-primary-hover);
    }
  }

  &--secondary {
    background: var(--color-surface);
    border-color: var(--color-border);
    color: var(--color-text);
    &:hover:not(:disabled) {
      border-color: var(--color-primary);
    }
  }

  &--danger {
    background: var(--color-danger);
    color: #fff;
    &:hover:not(:disabled) {
      background: var(--color-danger-hover);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--color-text-muted);
    &:hover:not(:disabled) {
      background: var(--color-bg);
      color: var(--color-text);
    }
  }
}
</style>
