<script setup>
import { onMounted, ref, reactive, watch } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
import { useFlashMessageStore } from '@/stores/flashMessage'
import router from '@/router'
import { useRoute } from 'vue-router'

const route = useRoute()
const book = ref({})
const books = reactive({ preview: null })
const categories = ref([])
const authors = ref([])
const selected = ref({ categorie: '', author: '' })
const open = ref(null)
const idCat = ref('')

const fetchBook = async (id) => {
  try {
    const response = await ouvrageServices.getBookById(id)
    book.value = response.data.ouvrage
    idCat.value = book.value.categorie_fk

    const catRes = await ouvrageServices.getCategorieById(idCat.value)
    selected.value.categorie = {
      id: catRes.data.data.categorie_id,
      nom: catRes.data.data.nom,
    }
    const authRes = await ouvrageServices.getAuthorById(book.value.ecrivain_fk)
    selected.value.author = {
      id: authRes.data.data.ecrivain_id,
      nom: authRes.data.data.prenom + ' ' + authRes.data.data.nom,
    }

    books.preview = null
  } catch (error) {
    console.error('Error fetching book:', error)
  }
}

watch(
  () => route.params.id,
  (newId) => {
    if (newId) fetchBook(newId)
  },
  { immediate: true },
)

onMounted(() => {
  fetchBook(route.params.id)
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

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    book.value.image = file
    if (books.preview) URL.revokeObjectURL(books.preview)
    books.preview = URL.createObjectURL(file)
  }
}
const champs = {
  titre: true,
  resume: true,
  nb_pages: true,
  nom_editeur: true,
  user_fk: true,
  extrait: true,
  annee_edition: true,
  categorie: true,
  image: true,
  author: true,
}

const flashMessageStore = useFlashMessageStore()

const checkValid = async () => {
  let imagePath = book.value.image
  if (book.value.image instanceof File) {
    const formData = new FormData()
    formData.append('image', book.value.image)
    try {
      const response = await ouvrageServices.uploadImage(formData)
      imagePath = response.data.filePath
    } catch (e) {
      flashMessageStore.setFlashMessage('error', "Erreur lors de l'upload de l'image")
      return false
    }
  }

  if (!book.value.titre.trim()) {
    champs.titre = false
  } else {
    champs.titre = true
  }
  if (!selected.value.author) {
    champs.author = false
  } else {
    champs.author = true
  }
  if (!selected.value.categorie) {
    champs.categorie = false
  } else {
    champs.categorie = true
  }
  if (!book.value.resume.trim()) {
    champs.resume = false
  } else {
    champs.resume = true
  }
  if (!book.value.nb_pages) {
    champs.nb_pages = false
  } else {
    champs.nb_pages = true
  }
  if (!book.value.annee_edition) {
    champs.annee_edition = false
  } else {
    champs.annee_edition = true
  }
  if (!book.value.nom_editeur.trim()) {
    champs.nom_editeur = false
  } else {
    champs.nom_editeur = true
  }
  if (!book.value.extrait.trim()) {
    champs.extrait = false
  } else {
    champs.extrait = true
  }
  if (!book.value.image) {
    champs.image = false
  } else {
    champs.image = true
  }

  const data = {
    titre: book.value.titre,
    image: imagePath,
    nb_pages: Number(book.value.nb_pages),
    nom_editeur: book.value.nom_editeur,
    resume: book.value.resume,
    categorie_fk: Number(selected.value.categorie.id),
    extrait: book.value.extrait,
    annee_edition: book.value.annee_edition,
    ecrivain_fk: Number(selected.value.author.id),
  }

  if (
    !book.value.titre?.trim() ||
    !imagePath ||
    !book.value.nb_pages ||
    !book.value.nom_editeur?.trim() ||
    !book.value.resume?.trim() ||
    !selected.value.categorie ||
    !book.value.extrait?.trim() ||
    !selected.value.author ||
    !book.value.annee_edition
  ) {
    flashMessageStore.setFlashMessage(
      'error',
      'Tous les champs sont obligatoires. Veuillez les remplir.',
    )
    return false
  }
  flashMessageStore.setFlashMessage('success', 'Livre modifié avec succès !')
  await ouvrageServices.updateBook(route.params.id, data)
  router.push({ name: 'ouvrages' })
  return true
}

const toggleSelect = (name) => {
  open.value = open.value === name ? null : name
}

const selectOption = (name, value) => {
  selected.value[name] = value
  open.value = null
}
const clickFilter = () => {
  if (open.value == 'categorie') {
    open.value = null
  }
}
</script>

<template>
  <div class="book-detail">
    <div v-if="flashMessageStore.type" :class="['flash-message', flashMessageStore.type]">
      {{ flashMessageStore.message }}
    </div>
    <input type="file" id="fileInput" @change="handleFileUpload" accept="image/*" hidden />
    <label for="fileInput" class="uploadImage noBorder">
      <img
        v-if="books.preview"
        :src="books.preview"
        alt="Image sélectionnée"
        :class="['uploadImage', { uploadImageError: !champs.image }]"
      />
      <img
        v-else
        class="uploadedImage"
        :src="
          book && book.image && typeof book.image === 'string'
            ? `http://localhost:3000${book.image}`
            : ''
        "
        alt="Image actuelle"
      />
    </label>

    <div class="info">
      <div class="title">
        <div class="title_author">
          <label for="titre">Titre du livre</label>
          <input
            id="titre"
            type="text"
            v-model="book.titre"
            placeholder="Exemple : Les Misérables"
            class="editable-input title-input"
            :class="{ 'editable-inputError': !champs.titre }"
          />
          <div class="authors">
            <div class="author-select" @click="toggleSelect('author')">
              <div class="selectedAuthor">{{ selected.author.nom || 'Auteur' }}</div>
              <ul class="optionsAuthor" v-show="open === 'author'">
                <li
                  v-for="author in authors"
                  :key="author.id"
                  @click.stop="selectOption('author', author)"
                >
                  {{ author.nom }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="custom-select" @click="toggleSelect('categorie')">
          <div id="categorie" class="selected">
            {{ selected.categorie.nom || 'Catégorie' }}
          </div>
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
      </div>
      <div>
        <label for="resume">Résumé</label>
        <textarea
          id="resume"
          v-model="book.resume"
          placeholder="Exemple : Ce livre raconte l'histoire de..."
          class="editable-textarea"
          :class="{ 'editable-inputError': !champs.resume }"
        ></textarea>
      </div>
      <div>
        <label for="nb_pages">Nombre de pages</label>
        <input
          id="nb_pages"
          type="number"
          v-model="book.nb_pages"
          placeholder="Exemple : 350"
          class="editable-input"
          :class="{ 'editable-inputError': !champs.nb_pages }"
        />
      </div>
      <div>
        <label for="formattedDate">Année d'édition</label>
        <input
          id="formattedDate"
          type="date"
          v-model="book.annee_edition"
          placeholder="Exemple : 1862"
          class="editable-input"
          :class="{ 'editable-inputError': !champs.annee_edition }"
        />
      </div>
      <div>
        <label for="nom_editeur">Éditeur</label>
        <input
          id="nom_editeur"
          type="text"
          v-model="book.nom_editeur"
          placeholder="Exemple : Gallimard"
          class="editable-input"
          :class="{ 'editable-inputError': !champs.nom_editeur }"
        />
      </div>
      <div>
        <label for="extrait">Lien vers un extrait</label>
        <input
          id="extrait"
          type="text"
          v-model="book.extrait"
          placeholder="Exemple : https://exemple.com/extrait.pdf"
          class="editable-input"
          :class="{ 'editable-inputError': !champs.extrait }"
        />
      </div>
      <button class="valid" @click="checkValid">Modifier</button>
    </div>
  </div>
</template>

<style scoped>
.authors {
  display: flex;
  align-items: center;
  justify-content: center;
}
.title_author {
  width: 532px;
}
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

.flash-message.error {
  background-color: #f44336;
  color: white;
}

@keyframes fade-in-out {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  10%,
  90% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
}

input[type='date'],
.editable-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
}

input[type='date']:focus,
.editable-input:focus,
.editable-textarea:focus {
  outline: none;
  border-color: #1d72b8;
  box-shadow: 0 0 5px rgba(29, 114, 184, 0.5);
}

.editable-textarea {
  width: 100%;
  min-height: 100px;
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 10px;
  box-sizing: border-box;
  resize: vertical;
}

.title-input {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.valid {
  align-self: flex-start;
  margin-top: 20px;
  padding: 10px 18px;
  background-color: #1d72b8;
  color: white;
  font-weight: 500;
  border-radius: 6px;
  border: none;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.valid:hover {
  background-color: #155a96;
  transform: scale(1.05);
}

.uploadedImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  display: block;
  transition: filter 0.4s ease;
}

.uploadedImage:hover {
  filter: brightness(0.6) saturate(1.3);
}

.uploadImage {
  width: 470px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 2px grey;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.noBorder {
  border: none;
}
.uploadImage:hover {
  background-color: rgba(128, 128, 128, 0.308);
}

.uploadImage .chooseImage {
  width: 80px;
  transition: transform 0.3s ease-in-out;
}

.uploadImage:hover .chooseImage {
  transform: scale(1.1);
}
.author-select {
  width: 100%;
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  user-select: none;
  height: 36px;
  display: flex;
  align-items: center;
  font-style: italic;
  color: #555;
}

.custom-select {
  margin-left: 15px;
  position: relative;
  font-size: 24px;
  color: white;
  background-color: #1d72b8;
  padding: 0 20px;
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
  height: 43px;
  display: flex;
  align-items: center;
  margin-top: 20px;
}
.selectedAuthor {
  width: 100%;
  padding-right: 50px;
  height: 100%;
  display: flex;
  align-items: center;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="grey" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 24px 24px;
}
.optionsAuthor {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid;
  border-radius: 12px;
  margin-top: 5px;
  z-index: 10;
  overflow: hidden;
  padding: 0;
  list-style: none;
}
.optionsAuthor li {
  padding: 10px 20px;
  cursor: pointer;
  color: #555;
  transition:
    background-color 0.1s ease-in-out,
    color 0.1s ease-in-out;
}

.optionsAuthor li:hover {
  background-color: rgba(117, 109, 109, 0.404);
  color: white;
}

.selected {
  width: 100%;
  padding-right: 50px;
  height: 100%;
  display: flex;
  align-items: center;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 24px 24px;
}

.options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #1d72b8;
  border-radius: 12px;
  margin-top: 5px;
  z-index: 10;
  overflow: hidden;
  padding: 0;
  list-style: none;
}

.options li {
  padding: 10px 20px;
  cursor: pointer;
  color: white;
  transition: background 0.2s;
}

.options li:hover {
  background-color: #1e5888;
}
.editable-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.book-detail {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  max-width: 1300px;
  margin: 15px auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 12px;
}

.title {
  display: flex;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .book-detail {
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  .info h2 {
    text-align: center;
  }

  .extrait-link {
    align-self: center;
  }
}

.uploadImageError {
  border: 1px solid #f44336 !important;
  color: #f44336 !important;
  background-color: #ffe6e6 !important;
}
.editable-inputError {
  border: 1px solid #f44336 !important;
  color: #f44336 !important;
  background-color: #ffe6e6 !important;
}

.editable-inputError::placeholder {
  color: #f44336 !important;
  opacity: 0.7 !important;
}

@keyframes fade-in-out {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  10%,
  90% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
}
</style>
