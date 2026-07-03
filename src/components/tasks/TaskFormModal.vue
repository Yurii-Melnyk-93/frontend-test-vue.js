<template>
  <BaseModal
    :open="open"
    :title="isEditing ? 'Редагувати завдання' : 'Нове завдання'"
    @close="emit('close')"
  >
    <form novalidate @submit.prevent="onSubmit">
      <FormField label="Назва завдання" :error="errors.name" required>
        <input v-model="name" v-bind="nameAttrs" type="text" placeholder="Що потрібно зробити?" />
      </FormField>

      <FormField label="Статус" :error="errors.status" required>
        <select v-model="status" v-bind="statusAttrs">
          <option v-for="option in statusOptions" :key="option" :value="option">
            {{ TASK_STATUS_LABELS[option] }}
          </option>
        </select>
      </FormField>

      <FormField label="Виконавець" :error="errors.assignee">
        <select v-model="assignee" v-bind="assigneeAttrs">
          <option value="">— Не призначено —</option>
          <option v-for="member in TEAM_MEMBERS" :key="member" :value="member">{{ member }}</option>
        </select>
      </FormField>

      <FormField label="Термін виконання" :error="errors.dueDate" required>
        <input
          v-model="dueDate"
          v-bind="dueDateAttrs"
          type="date"
          :min="today"
          @click="openDatePicker"
        />
      </FormField>

      <div class="form-actions">
        <BaseButton variant="secondary" type="button" @click="emit('close')">Скасувати</BaseButton>
        <BaseButton variant="primary" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Збереження…' : isEditing ? 'Зберегти' : 'Додати' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import FormField from '@/components/common/FormField.vue'
import { taskFormSchema, type TaskFormValues } from '@/validation/schemas'
import { TASK_STATUS_LABELS, TaskStatus } from '@/types/enums'
import { TEAM_MEMBERS } from '@/constants/team'
import { useTasksStore } from '@/stores/tasks'
import { useToast } from '@/composables/useToast'
import { ApiError } from '@/types/api'
import type { Task } from '@/types/task'

const props = defineProps<{
  open: boolean
  projectId: number
  task?: Task | null
}>()
const emit = defineEmits<{ close: [] }>()

const store = useTasksStore()
const toast = useToast()

const today = new Date().toISOString().slice(0, 10)
const isEditing = computed(() => props.task != null)
const statusOptions = Object.values(TaskStatus)

const { handleSubmit, errors, defineField, resetForm, isSubmitting } = useForm<TaskFormValues>({
  validationSchema: taskFormSchema,
  initialValues: { name: '', status: TaskStatus.Todo, dueDate: today, assignee: '' },
})

const [name, nameAttrs] = defineField('name')
const [status, statusAttrs] = defineField('status')
const [dueDate, dueDateAttrs] = defineField('dueDate')
const [assignee, assigneeAttrs] = defineField('assignee')

// Populate the form on open (task values or defaults).
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      return
    }
    if (props.task != null) {
      resetForm({
        values: {
          name: props.task.name,
          status: props.task.status,
          dueDate: props.task.dueDate,
          assignee: props.task.assignee ?? '',
        },
      })
    } else {
      resetForm({ values: { name: '', status: TaskStatus.Todo, dueDate: today, assignee: '' } })
    }
  },
)

// Calendar opens on clicking the whole input, not just the icon.
function openDatePicker(event: MouseEvent): void {
  const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void }
  try {
    input.showPicker?.()
  } catch {
    // showPicker throws if unsupported — ignore.
  }
}

const onSubmit = handleSubmit(async (values) => {
  const assigneeValue = values.assignee === '' ? null : values.assignee
  try {
    if (props.task != null) {
      await store.updateTask(props.task.id, {
        name: values.name,
        status: values.status,
        dueDate: values.dueDate,
        assignee: assigneeValue,
      })
      toast.success('Завдання оновлено')
    } else {
      await store.createTask({
        projectId: props.projectId,
        name: values.name,
        status: values.status,
        dueDate: values.dueDate,
        assignee: assigneeValue,
      })
      toast.success('Завдання успішно додано')
    }
    emit('close')
  } catch (e) {
    toast.error(e instanceof ApiError ? e.message : 'Не вдалося зберегти завдання')
  }
})
</script>

<style scoped lang="scss">
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-2);
}
</style>
