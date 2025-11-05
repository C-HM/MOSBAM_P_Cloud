<script setup>
import { onMounted, ref } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
const categories = ref([])
const authors = ref([])
const search = ref('')
const emit = defineEmits(['title', 'author', 'categorie', 'seeAll'])

onMounted(() => {
  ouvrageServices.getAllCategories().then((res) => {
    categories.value = res.data.data.map((cat) => ({
      id: cat.categorie_id,
      nom: cat.nom,
    }))
  })
  ouvrageServices.getAllAuthors().then((res) => {
    authors.value = res.data.data.map((auth) => ({
      id: auth.ecrivain_id,
      nom: auth.prenom + ' ' + auth.nom,
    }))
  })
})
const selected = ref({
  categorie: '',
  author: '',
})

const open = ref(null)
const toggleSelect = (name) => {
  open.value = open.value === name ? null : name
  emit('open', open.value)
}

const selectOption = (name, value) => {
  selected.value[name] = value
  open.value = null
  emit(name, value.id)
}
const searchEmit = () => {
  if (search.value.length > 2 || search.value.length == 0) {
    emit('title', search.value)
  }
}
const seeAll = () => {
  open.value = null
  selected.value = {
    categorie: '',
    author: '',
  }
  search.value = ''
  emit('seeAll')
}
const clickFilter = () => {
  open.value = null
}
</script>

<template>
  <div class="filters">
    <div class="custom-select" @click.stop="toggleSelect('categorie')">
      <div class="selected">{{ selected.categorie.nom || 'Catégorie' }}</div>
      <ul class="options" v-show="open === 'categorie'">
        <li
          v-for="categorie in categories"
          :key="categorie.id"
          @click.stop="selectOption('categorie', categorie)"
        >
          {{ categorie.nom }}
        </li>
      </ul>
    </div>
    <div class="custom-select" @click.stop="toggleSelect('author')">
      <div class="selected">{{ selected.author.nom || 'Auteur' }}</div>
      <ul class="options" v-show="open === 'author'">
        <li v-for="author in authors" :key="author.id" @click.stop="selectOption('author', author)">
          {{ author.nom }}
        </li>
      </ul>
    </div>

    <input
      @click="clickFilter"
      type="text"
      placeholder="Recherche livre"
      v-model="search"
      @keyup="searchEmit"
    />
    <button type="button" @click="seeAll">Tout voir</button>
  </div>
</template>
<style scoped>
.filters {
  width: 98%;
  background-color: #6096ba;
  padding: 5px;
  border-radius: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin: 10px auto;
  position: sticky;
  top: 10px;
  z-index: 20;
}

.custom-select {
  position: relative;
  font-size: 24px;
  color: white;
  background-color: #a3cef1;
  padding: 0px 20px;
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
}

.custom-select .selected {
  height: 34px;
  padding-right: 50px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0px center;
  background-size: 30px 30px;
}

.custom-select .options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #a3cef1;
  border-radius: 12px;
  margin-top: 5px;
  z-index: 10;
  overflow: hidden;
  padding: 0;
  list-style: none;
}

.custom-select .options li {
  padding: 10px 20px;
  cursor: pointer;
  color: white;
  transition: background 0.2s;
}

.custom-select .options li:hover {
  background-color: #6096ba;
}

.filters input[type='text'] {
  padding: 3px 20px 3px 55px;
  border-radius: 999px;
  border: none;
  background-color: #a3cef1;
  color: white;
  font-size: 24px;
  background-image:
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="gray" width="24" height="24" viewBox="0 0 24 24"><path d="M21.53 20.47l-5.1-5.1A7.94 7.94 0 0018 10a8 8 0 10-8 8 7.94 7.94 0 005.37-1.57l5.1 5.1a.75.75 0 101.06-1.06zM4 10a6 6 0 1112 0 6 6 0 01-12 0z"/></svg>'),
    linear-gradient(to right, gray 2px, transparent 2px);
  background-repeat: no-repeat;
  background-position:
    12px center,
    40px center;
  background-size:
    24px 24px,
    2px 70%;
}

.filters button {
  padding: 3px 20px;
  border-radius: 999px;
  font-size: 24px;
  background-color: transparent;
  border: 1.5px solid white;
  color: white;
  cursor: pointer;
}

.filters button:hover {
  background-color: #327ab0;
}
</style>
