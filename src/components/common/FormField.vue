<template>
  <label class="field">
    <span class="field__label">
      {{ label }}
      <span v-if="required" class="field__required">*</span>
    </span>
    <slot />
    <span v-if="error" class="field__error">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  error?: string
  required?: boolean
}>()
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-4);

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text);
  }

  &__required {
    color: var(--color-danger);
  }

  &__error {
    font-size: 12px;
    color: var(--color-danger);
    min-height: 14px;
  }
}

.field :deep(input),
.field :deep(select) {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.15);
  }
}

// Custom select arrow.
.field :deep(select) {
  @include select-arrow;
}
</style>
