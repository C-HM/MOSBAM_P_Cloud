<script setup>
import booksCard from '@/components/booksCard.vue'
import ouvrageServices from '../../services/ouvrageServices'
import { onMounted, ref } from 'vue'

const books = ref([])

onMounted(() => {
  ouvrageServices
    .getAllBooks()
    .then((response) => {
      const sortedBooks = response.data.data.sort(
        (a, b) => new Date(b.ouvrage.createdAt) - new Date(a.ouvrage.createdAt),
      )
      books.value = sortedBooks.slice(0, 6)
    })
    .catch((error) => {
      console.error('Erreur lors de la récupération des livres :', error)
    })
})
</script>

<template>
  <section class="hero">
    <h1 class="hero-title">La lecture prend vie, partagez vos découvertes !</h1>
    <img src="../../public/images/Image_accueil.png" alt="image d'accueil" class="hero-image" />
    <div class="hero-description">
      <h2>Bienvenue sur <span class="highlight">Lire & Partager</span> !</h2>
      <p>
        Découvrez un espace dédié aux amoureux des livres ! Sur Lire & Partager, vous pouvez
        explorer de nouveaux ouvrages, partager vos lectures préférées et interagir avec d'autres
        passionnés. Notre plateforme vous permet de découvrir, noter et commenter les livres que
        vous aimez, tout en contribuant à une communauté active de lecteurs.
      </p>
    </div>
  </section>

  <main>
    <h2 class="nouveauté">Les dernières nouveautés</h2>
    <section class="books-container">
      <div class="books">
        <booksCard v-for="book in books" :key="book.id" :book="book" />
      </div>
    </section>
  </main>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f5f7fa, #e4ebf1);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 40px;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #1d3557;
}

.hero-image {
  max-width: 80%;
  height: auto;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hero-description {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
}

.hero-description h2 {
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #2a4365;
}

.hero-description .highlight {
  color: #1d72b8;
  font-weight: bold;
}

.books-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.books {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(auto);
  gap: 20px;
}
img {
  width: 100%;
  height: 30%;
}

.nouveauté {
  text-align: center;
}
</style>
