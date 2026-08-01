<template>
  <BaseModal
    :open="open"
    :title="isEditing ? 'Edit Project' : 'New Project'"
    @close="emit('close')"
  >
    <form novalidate @submit.prevent="onSubmit">
      <FormField label="Project name" :error="errors.name" required>
        <input v-model="name" v-bind="nameAttrs" type="text" placeholder="E.g. Website redesign" />
      </FormField>

      <FormField label="Project description" :error="errors.description">
        <textarea
          v-model="description"
          v-bind="descriptionAttrs"
          rows="3"
          placeholder="Optional"
        />
      </FormField>

      <div class="form-actions">
        <BaseButton variant="secondary" type="button" @click="emit('close')">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit" :disabled="submitting">
          {{ submitting ? 'Saving…' : isEditing ? 'Save' : 'Create' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import FormField from '@/components/common/FormField.vue'
import { projectFormSchema } from '@/validation/schemas'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/composables/useToast'
import { ApiError } from '@/types/api'
import type { Project } from '@/types/project'

const props = defineProps<{ open: boolean; project?: Project | null }>()
const emit = defineEmits<{ close: [] }>()

const store = useProjectsStore()
const toast = useToast()
const submitting = ref(false)

const isEditing = computed(() => props.project != null)

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: projectFormSchema,
  initialValues: { name: '', description: '' },
})

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')

// Populate the form on open (project values or defaults).
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      return
    }
    resetForm({
      values: {
        name: props.project?.name ?? '',
        description: props.project?.description ?? '',
      },
    })
  },
)

const onSubmit = handleSubmit(async (values) => {
  submitting.value = true
  try {
    if (props.project != null) {
      await store.updateProject(props.project.id, {
        name: values.name,
        description: values.description,
      })
      toast.success('Project updated')
    } else {
      await store.createProject({ name: values.name, description: values.description })
      toast.success('Project created successfully')
    }
    emit('close')
  } catch (e) {
    toast.error(e instanceof ApiError ? e.message : 'Failed to save the project')
  } finally {
    submitting.value = false
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

textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  color: var(--color-text);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.15);
  }
}
</style>
