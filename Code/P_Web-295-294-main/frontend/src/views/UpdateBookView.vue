<script setup>
import { ref } from 'vue'
import updateBook from '@/components/updateBook.vue'

const bookData = ref({
  titre: '',
  auteur: '',
  resume: '',
  nb_pages: '',
  annee_edition: '',
  nom_editeur: '',
  image: '',
  auteur_fk: '',
  categorie_fk: '',
  extrait: '',
})
</script>
<template>
  <h1>Modifier le livre</h1>
  <updateBook :bookData="bookData"></updateBook>
</template>
<style scoped>
h1 {
  font-size: 35px;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}
</style>
