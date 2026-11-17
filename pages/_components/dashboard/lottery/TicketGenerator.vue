<template>
  <div class="main__content main__content--column">
    <div class="main__wrapper">
      <div class="main__inner main__inner--short">
        <span class="main__text">{{ $t('text.generator_tickets') }}</span>
        <input
          type="number"
          class="main__input input"
          style="width: 100px;"
          min="1"
          :value="ticketsCount"
          @input="$emit('update:ticketsCount', $event.target.value)"
          :placeholder="$t('text.required_tickets')"
        />
        <button 
          class="btn" 
          @click="$emit('generate')" 
          :disabled="isGenerating"
        >
          {{ isGenerating ? $t('text.generating') : $t('text.start_generation') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isGenerating: boolean;
  ticketsCount: number;
}>();

defineEmits<{
  (e: 'generate'): void;
  (e: 'update:ticketsCount', value: number): void;
}>();
</script> 