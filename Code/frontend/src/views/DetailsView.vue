<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ouvrageServices from '../../services/ouvrageServices'
import detail from '@/components/detail.vue'
import comments from '@/components/comments.vue'

const route = useRoute()
const book = ref([])
const detailRef = ref(null)

function refreshNotes() {
  if (detailRef.value && detailRef.value.reloadNotes) {
    detailRef.value.reloadNotes()
  }
}
function fetchBook(id) {
  ouvrageServices
    .getBookById(id)
    .then((response) => {
      book.value = response.data
    })
    .catch((error) => {
      console.error('Error fetching book:', error)
    })
}

// Recharger le livre à chaque changement d'id dans l'URL
watch(
  () => route.params.id,
  (newId) => {
    if (newId) fetchBook(newId)
  },
  { immediate: true }, // pour exécuter au premier chargement aussi
)
</script>

<template>
  <detail :book="book" ref="detailRef" />
  <comments @comments-updated="refreshNotes" />
</template>
