<template>
  <div class="list list--five list--photo">
    <div class="list__topping">
      <span class="list__heading">{{ $t('text.batch_number') }}</span>
      <span class="list__heading">{{ $t('text.total_tickets') }}</span>
      <span class="list__heading">{{ $t('text.generation_date') }}</span>
      <span class="list__heading">{{ $t('text.download_csv') }}</span>
    </div>
    <div>
      <div v-for="item in generationsList" :key="item.generation_id" class="list__item">
        <span class="list__elem">#{{ item.generation_id }}</span>
        <span class="list__elem">{{ item.tickets_count }}</span>
        <span class="list__elem">{{ formatDate(item.created_at) }}</span>
        <span class="list__elem">
          <a 
            :href="`${baseUrl}lottery/tickets/all/${item.generation_id}`"
            target="_blank" 
            class="link"
          >
            {{ $t('text.download') }}
          </a>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';

const baseUrl = import.meta.env.VITE_API_URL;
const dayJs = inject('dayJS') as any;
const localization: any = useI18n();

defineProps<{
  generationsList: Array<any>;
}>();

const formatDate = (dateString: string | null): string => {
  if (!dateString) {
    return localization.t('text.no_data');
  }
  return dayJs(dateString).format('DD/MM/YYYY HH:mm');
};
</script> 