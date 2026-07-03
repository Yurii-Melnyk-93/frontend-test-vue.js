<template>
  <div class="app-shell">
    <header class="app-shell__header">
      <RouterLink to="/" class="app-shell__brand">
        <span class="app-shell__logo">PM</span>
        <span>Управління проектами</span>
      </RouterLink>
    </header>

    <main class="app-shell__main">
      <RouterView />
    </main>

    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>

<style scoped lang="scss">
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-3) var(--space-6);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  &__brand {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    font-weight: 600;
    font-size: 16px;
  }

  &__logo {
    display: inline-grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    background: var(--color-primary);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
  }

  &__main {
    flex: 1;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: var(--space-6);
  }
}
</style>
