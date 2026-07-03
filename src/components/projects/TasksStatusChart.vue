<template>
  <div class="chart-card">
    <h3 class="chart-card__title">Розподіл завдань за статусами</h3>
    <div v-if="total > 0" class="chart-card__canvas">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="chart-card__empty">Немає завдань для відображення.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { ArcElement, Chart as ChartJS, Legend, Tooltip, type ChartData } from 'chart.js'
import { TASK_STATUS_LABELS, TaskStatus } from '@/types/enums'
import { useTasksStore } from '@/stores/tasks'

ChartJS.register(ArcElement, Tooltip, Legend)

const store = useTasksStore()

const counts = computed<Record<TaskStatus, number>>(() => {
  const acc: Record<TaskStatus, number> = {
    [TaskStatus.Todo]: 0,
    [TaskStatus.InProgress]: 0,
    [TaskStatus.Done]: 0,
  }
  for (const task of store.items) {
    acc[task.status] += 1
  }
  return acc
})

const total = computed(() => store.items.length)

const chartData = computed<ChartData<'doughnut'>>(() => ({
  labels: [
    TASK_STATUS_LABELS[TaskStatus.Todo],
    TASK_STATUS_LABELS[TaskStatus.InProgress],
    TASK_STATUS_LABELS[TaskStatus.Done],
  ],
  datasets: [
    {
      data: [
        counts.value[TaskStatus.Todo],
        counts.value[TaskStatus.InProgress],
        counts.value[TaskStatus.Done],
      ],
      backgroundColor: ['#6b7480', '#d9822b', '#2f9e63'],
      borderWidth: 0,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { position: 'bottom' as const, labels: { boxWidth: 12, padding: 12 } },
  },
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.chart-card {
  @include card;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;

  &__title {
    margin: 0 0 var(--space-4);
    font-size: 15px;
  }

  &__canvas {
    height: 240px;
  }

  &__empty {
    color: var(--color-text-muted);
    text-align: center;
    margin: auto 0;
  }
}
</style>
