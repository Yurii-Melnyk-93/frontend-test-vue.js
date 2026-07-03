<template>
  <article class="card">
    <div class="card__head">
      <span class="card__id">#{{ task.id }}</span>
      <div class="card__actions">
        <button class="card__btn" title="Редагувати" @click.stop="$emit('edit', task)">✎</button>
        <button
          class="card__btn card__btn--danger"
          title="Видалити"
          @click.stop="$emit('remove', task.id)"
        >
          🗑
        </button>
      </div>
    </div>
    <p class="card__name">{{ task.name }}</p>
    <div class="card__meta">
      <span class="card__assignee">
        <span class="card__avatar">{{ task.assignee ? task.assignee.charAt(0) : '—' }}</span>
        {{ task.assignee ?? 'Не призначено' }}
      </span>
      <span class="card__due" :class="{ 'card__due--overdue': isOverdue }">
        {{ formatDate(task.dueDate) }}
      </span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/types/task'

const props = defineProps<{ task: Task }>()
defineEmits<{ edit: [task: Task]; remove: [id: number] }>()

const today = new Date().toISOString().slice(0, 10)
const isOverdue = computed(() => props.task.dueDate < today && props.task.status !== 'done')
const formatDate = (iso: string): string => new Date(`${iso}T00:00:00`).toLocaleDateString('uk-UA')
</script>

<style scoped lang="scss">
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  box-shadow: var(--shadow);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__id {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &__actions {
    display: flex;
    gap: 2px;
    opacity: 0;
    transition: opacity 0.12s ease;
  }

  &:hover &__actions {
    opacity: 1;
  }

  &__btn {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    padding: 2px 4px;
    border-radius: 4px;
    color: var(--color-text-muted);
    transition: background 0.12s ease, color 0.12s ease;
    &:hover {
      background: rgba(31, 39, 51, 0.1);
      color: var(--color-text);
    }
  }

  &__name {
    margin: var(--space-2) 0 var(--space-3);
    font-weight: 500;
    font-size: 14px;
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
  }

  &__assignee {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &__avatar {
    display: inline-grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-primary);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
  }

  &__due {
    font-size: 12px;
    color: var(--color-text-muted);
    &--overdue {
      color: var(--color-danger);
      font-weight: 600;
    }
  }
}
</style>
