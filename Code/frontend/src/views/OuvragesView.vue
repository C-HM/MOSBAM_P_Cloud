<script setup>
import Filter from '@/components/filter.vue'
import ouvrageServices from '../../services/ouvrageServices'
import booksCard from '@/components/booksCard.vue'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFlashMessageStore } from '@/stores/flashMessage'

const route = useRoute()
const title = ref('')
const authorId = ref(0)
const categorieId = ref(0)
const books = ref([])
const filteredBooks = ref([])
const errorMessage = ref(false)
const flashMessageStore = useFlashMessageStore()

const fetchBooks = () => {
  ouvrageServices
    .getAllBooks({ title: title.value })
    .then((response) => {
      errorMessage.value = false
      books.value = response.data.data
      applyFilters()
    })
    .catch((error) => {
      errorMessage.value = true
      filteredBooks.value = null
      console.error('Erreur lors de la récupération des livres :', error.response.data.error)
    })
}

const flashMessage = ref({ type: '', message: '' })
onMounted(() => {
  fetchBooks()

  if (flashMessageStore.type) {
    fetchBooks()
    flashMessage.value = {
      type: flashMessageStore.type,
      message: flashMessageStore.message,
    }

    setTimeout(() => {
      flashMessage.value = { type: '', message: '' }
      flashMessageStore.clearFlashMessage()
    }, 3000)
  }
})
const emitTitle = (searchValue) => {
  title.value = searchValue
  fetchBooks()
}
const filterAuthor = (authorValue) => {
  authorId.value = authorValue
  applyFilters()
}

const filterCategorie = (categorieValue) => {
  categorieId.value = categorieValue
  applyFilters()
}
const applyFilters = () => {
  filteredBooks.value = books.value.filter((book) => {
    const matchAuthor = authorId.value === 0 || book.ouvrage.ecrivain_fk === authorId.value
    const matchCategory = categorieId.value === 0 || book.ouvrage.categorie_fk === categorieId.value
    return matchAuthor && matchCategory
  })
  if (filteredBooks.value.length == 0) errorMessage.value = true
  else errorMessage.value = false
}
const seeAll = () => {
  authorId.value = 0
  categorieId.value = 0
  title.value = 0
  fetchBooks()
}
</script>

<template>
  <div v-if="flashMessage.message" :class="['flash-message', flashMessage.type]">
    {{ flashMessage.message }}
  </div>
  <Filter
    @title="emitTitle"
    @author="filterAuthor"
    @categorie="filterCategorie"
    @seeAll="seeAll"
  ></Filter>
  <section class="books-container">
    <p id="errorMessage" v-show="errorMessage">Aucun livre ne correspond à la recherche</p>
    <div class="books">
      <booksCard v-for="book in filteredBooks" :key="book.id" :book="book" />
    </div>
  </section>
  <RouterLink to="/addBook" class="addBook" title="Ajouter un livre">+</RouterLink>
</template>

<style scoped>
.flash-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: fade-in-out 3s ease-in-out;
}

.flash-message.success {
  background-color: #4caf50;
  color: white;
}

.addBook {
  text-decoration: none;
  right: 30px;
  bottom: 30px;
  font-size: 70px;
  background-color: #6096ba;
  color: white;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  user-select: none;
  cursor: pointer;
  position: fixed;
  transition:
    box-shadow 0.3s ease-in-out,
    transform 0.3s ease-in-out;
}
.addBook:hover {
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.3);
  transform: scale(1.15) translate(-5px, -5px);
}
.books-container {
  width: 100%;
  display: flex;
  justify-content: center;
}
#errorMessage {
  font-size: 1.2rem;
  color: #e53e3e;
  background: #ffeaea;
  border: 1.5px solid #e53e3e;
  border-radius: 8px;
  padding: 16px 24px;
  margin: 32px auto 24px auto;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 2px 12px rgba(229, 62, 62, 0.08);
  letter-spacing: 0.5px;
  font-weight: 600;
  transition:
    background 0.2s,
    border 0.2s;
}
.books {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(auto);
  gap: 20px;
}
</style>
