<template>
  <div class="filters">
    <input
      v-model="searchInput"
      class="filters__search"
      type="search"
      placeholder="Пошук за назвою…"
      aria-label="Пошук проектів за назвою"
    />
    <select v-model="status" class="filters__status" aria-label="Фільтр за статусом">
      <option value="all">Усі статуси</option>
      <option v-for="option in statusOptions" :key="option" :value="option">
        {{ PROJECT_STATUS_LABELS[option] }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { PROJECT_STATUS_LABELS, ProjectStatus } from '@/types/enums'
import { useDebouncedModel } from '@/composables/useDebounce'

const search = defineModel<string>('search', { required: true })
const status = defineModel<ProjectStatus | 'all'>('status', { required: true })

// Debounce search by 300ms so filtering doesn't run on every keystroke.
const searchInput = useDebouncedModel(search, 300)

const statusOptions = Object.values(ProjectStatus)
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.filters {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;

  &__search {
    flex: 1;
    min-width: 220px;
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    background: var(--color-surface);
  }

  &__status {
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    min-width: 160px;
    @include select-arrow;
  }

  &__search:focus,
  &__status:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}
</style>
