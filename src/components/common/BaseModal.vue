<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @mousedown.self="emit('close')">
        <div class="modal__dialog" role="dialog" aria-modal="true">
          <header class="modal__header">
            <h2 class="modal__title">{{ title }}</h2>
            <button class="modal__close" aria-label="Закрити" @click="emit('close')">×</button>
          </header>
          <div class="modal__body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

const props = defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{ close: [] }>()

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && props.open) {
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  background: rgba(20, 30, 55, 0.45);
  display: grid;
  place-items: center;
  padding: var(--space-4);
  z-index: 500;

  &__dialog {
    width: 100%;
    max-width: 480px;
    background: var(--color-surface);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    margin: 0;
    font-size: 16px;
  }

  &__close {
    border: none;
    background: transparent;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    color: var(--color-text-muted);
    &:hover {
      color: var(--color-text);
    }
  }

  &__body {
    padding: var(--space-5);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
  .modal__dialog {
    transition: transform 0.2s ease;
  }
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  .modal__dialog {
    transform: translateY(-12px) scale(0.98);
  }
}
</style>
