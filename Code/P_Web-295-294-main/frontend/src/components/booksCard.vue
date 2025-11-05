<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
})
const link = computed(() => `/ouvrages/${props.book.ouvrage.ouvrage_id}`)
</script>

<template>
  <RouterLink :to="link" class="card">
    <div class="image-container">
      <img
        :src="`http://localhost:3000${props.book.ouvrage.image}`"
        alt="image de couverture du livre"
      />
    </div>
    <div class="titre">
      <p>{{ props.book.ouvrage.titre }}</p>
    </div>
    <div>
      <p class="ecrivain">{{ props.book.écrivain }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>
.card {
  overflow: hidden;
  border-radius: 8px;
  border: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 220px;
  height: 350px;
  text-align: center;
  margin: 15px;
  box-sizing: border-box;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

img {
  height: 250px;
  width: 100%;
  object-fit: contain;
  background-color: #f8f8f8;
  transition: all 0.3s;
}

.titre {
  height: 100%;
  font-size: 16px;
  font-weight: bold;
  color: #333333;
  display: flex;
  align-items: center;
}

p {
  font-size: 20px;
  font-weight: bold;
  line-height: 25px;
  margin: 0;
}

a {
  text-decoration: none;
}

.ecrivain {
  height: 100%;
  font-size: 16px;
  font-weight: normal;
  color: #333333;
  display: flex;
  align-items: center;
}
</style>
