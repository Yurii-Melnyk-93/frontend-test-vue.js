<template>
  <div class="task-table-wrap">
    <table class="task-table">
      <colgroup>
        <col style="width: 44px" />
        <col style="width: 64px" />
        <col :style="{ width: `${widths.name}px` }" />
        <col :style="{ width: `${widths.assignee}px` }" />
        <col :style="{ width: `${widths.status}px` }" />
        <col :style="{ width: `${widths.dueDate}px` }" />
        <col style="width: 96px" />
      </colgroup>
      <thead>
        <tr>
          <th class="th" />
          <th class="th th--right">ID</th>
          <th class="th">
            Назва завдання
            <span class="th__resizer" @mousedown="startResize('name', $event)" />
          </th>
          <th class="th">
            Виконавець
            <span class="th__resizer" @mousedown="startResize('assignee', $event)" />
          </th>
          <th class="th">
            <button class="th__sort" type="button" @click="toggleSort('status')">
              Статус
              <span class="th__sorticon" aria-hidden="true">
                <span
                  class="th__caret th__caret--up"
                  :class="{ 'th__caret--active': directionFor('status') === 'asc' }"
                />
                <span
                  class="th__caret th__caret--down"
                  :class="{ 'th__caret--active': directionFor('status') === 'desc' }"
                />
              </span>
            </button>
            <span class="th__resizer" @mousedown="startResize('status', $event)" />
          </th>
          <th class="th">
            <button class="th__sort" type="button" @click="toggleSort('dueDate')">
              Термін
              <span class="th__sorticon" aria-hidden="true">
                <span
                  class="th__caret th__caret--up"
                  :class="{ 'th__caret--active': directionFor('dueDate') === 'asc' }"
                />
                <span
                  class="th__caret th__caret--down"
                  :class="{ 'th__caret--active': directionFor('dueDate') === 'desc' }"
                />
              </span>
            </button>
            <span class="th__resizer" @mousedown="startResize('dueDate', $event)" />
          </th>
          <th class="th th--right">Дії</th>
        </tr>
      </thead>

      <draggable
        v-model="dragModel"
        tag="tbody"
        item-key="id"
        handle=".drag-handle"
        :disabled="!dragEnabled"
        :animation="160"
        ghost-class="row--ghost"
      >
        <template #item="{ element }">
          <tr class="row">
            <td class="td td--drag">
              <span
                class="drag-handle"
                :class="{ 'drag-handle--off': !dragEnabled }"
                :title="dragEnabled ? 'Перетягніть, щоб змінити порядок' : 'Скиньте сортування для ручного порядку'"
                >⠿</span
              >
            </td>
            <td class="td td--right">{{ element.id }}</td>
            <td class="td td--name">{{ element.name }}</td>
            <td class="td">{{ element.assignee ?? '—' }}</td>
            <td class="td"><StatusBadge :status="element.status" /></td>
            <td class="td" :class="{ 'td--overdue': isOverdue(element) }">
              {{ formatDate(element.dueDate) }}
            </td>
            <td class="td td--actions">
              <button class="icon-btn" title="Редагувати" @click="emit('edit', element)">✎</button>
              <button class="icon-btn icon-btn--danger" title="Видалити" @click="emit('remove', element.id)">🗑</button>
            </td>
          </tr>
        </template>
      </draggable>
    </table>

    <p v-if="sortedItems.length === 0" class="task-table__empty">Завдань не знайдено.</p>
    <BaseButton
      v-if="!dragEnabled"
      variant="ghost"
      class="task-table__reset"
      @click="sortState = null"
    >
      Скинути сортування для ручного порядку
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import StatusBadge from '@/components/common/StatusBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useTableSort } from '@/composables/useTableSort'
import { useColumnResize } from '@/composables/useColumnResize'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useTaskDrag } from '@/composables/useTaskDrag'
import { KANBAN_COLUMNS } from '@/types/enums'
import type { SortState } from '@/types/api'
import type { Task } from '@/types/task'

const props = defineProps<{ tasks: Task[]; projectId: number }>()
const emit = defineEmits<{ edit: [task: Task]; remove: [id: number] }>()

type SortKey = 'status' | 'dueDate'
type WidthKey = 'name' | 'assignee' | 'status' | 'dueDate'

const drag = useTaskDrag()

const DEFAULT_WIDTHS: Record<WidthKey, number> = {
  name: 300,
  assignee: 150,
  status: 150,
  dueDate: 150,
}

const sortState = useLocalStorage<SortState<SortKey> | null>('ptm.tasks.sort', null)
const widths = useLocalStorage<Record<WidthKey, number>>('ptm.tasks.widths', DEFAULT_WIDTHS)

const statusRank = (status: Task['status']): number => KANBAN_COLUMNS.indexOf(status)

// Manual order — by the order field within the project.
const manualOrdered = computed<Task[]>(() =>
  [...props.tasks].sort((a, b) => a.order - b.order || a.id - b.id),
)

const { sortedItems, toggleSort, directionFor } = useTableSort<Task, SortKey>(
  manualOrdered,
  {
    status: (t) => statusRank(t.status),
    dueDate: (t) => Date.parse(t.dueDate),
  },
  sortState,
)

const { startResize } = useColumnResize<WidthKey>(DEFAULT_WIDTHS, widths)

// DnD only in manual mode (no active sorting).
const dragEnabled = computed(() => sortState.value === null)

const dragModel = computed<Task[]>({
  get: () => sortedItems.value,
  set: (list) => drag.applyTableOrder(props.projectId, list),
})

const today = new Date().toISOString().slice(0, 10)
const isOverdue = (task: Task): boolean => task.dueDate < today && task.status !== 'done'
const formatDate = (iso: string): string => new Date(`${iso}T00:00:00`).toLocaleDateString('uk-UA')
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.task-table-wrap {
  @include card;
  overflow-x: auto;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.th {
  position: relative;
  text-align: left;
  padding: var(--space-3) var(--space-4);
  // Gray header background — separates it from the rows.
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  // Column divider — a hint that the edge is draggable.
  border-right: 1px solid var(--color-border);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  user-select: none;

  &:last-child {
    border-right: none;
  }

  &--right {
    text-align: right;
  }

  &__sort {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: none;
    background: transparent;
    font: inherit;
    color: inherit;
    cursor: pointer;
    padding: 0;
    &:hover {
      color: var(--color-text);
    }
  }

  // Both arrows always visible, the active one is highlighted.
  &__sorticon {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    flex: 0 0 auto;
  }

  &__caret {
    width: 0;
    height: 0;
    border-left: 3.5px solid transparent;
    border-right: 3.5px solid transparent;
    opacity: 0.35;
    transition: opacity 0.12s ease, border-color 0.12s ease;

    &--up {
      border-bottom: 5px solid var(--color-text-muted);
    }
    &--down {
      border-top: 5px solid var(--color-text-muted);
    }
    &--up.th__caret--active {
      border-bottom-color: var(--color-primary);
      opacity: 1;
    }
    &--down.th__caret--active {
      border-top-color: var(--color-primary);
      opacity: 1;
    }
  }

  &__resizer {
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    &:hover {
      background: var(--color-primary);
      opacity: 0.4;
    }
  }
}

.row {
  transition: background 0.12s ease;
  &:hover {
    background: var(--color-bg);
  }
  &--ghost {
    opacity: 0.5;
    background: rgba(79, 110, 247, 0.1);
  }
  // Last row has no border — avoids doubling with the card edge.
  &:last-child .td {
    border-bottom: none;
  }
}

.td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  vertical-align: middle;

  &--right {
    text-align: right;
  }
  &--name {
    font-weight: 500;
    @include truncate;
  }
  &--drag {
    text-align: center;
  }
  &--overdue {
    color: var(--color-danger);
    font-weight: 600;
  }
  &--actions {
    text-align: right;
    white-space: nowrap;
  }
}

.drag-handle {
  cursor: grab;
  color: var(--color-text-muted);
  font-size: 16px;
  &--off {
    cursor: not-allowed;
    opacity: 0.4;
  }
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  transition: background 0.12s ease, color 0.12s ease;
  &:hover {
    // Overlay is visible on both white and hovered-gray rows.
    background: rgba(31, 39, 51, 0.1);
    color: var(--color-text);
  }
}

.task-table__empty {
  padding: var(--space-5);
  text-align: center;
  color: var(--color-text-muted);
}

.task-table__reset {
  margin: var(--space-2);
}
</style>
