<script setup>
import { onMounted, reactive, ref } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
import { useFlashMessageStore } from '@/stores/flashMessage'
import router from '@/router'

const book = reactive({
  image: null,
  preview: null, // <-- ajoute ceci
  titre: '',
  resume: '',
  nb_pages: '',
  nom_editeur: '',
  user_fk: '',
  extrait: '',
  annee_edition: '',
})

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

const categories = ref([])
const authors = ref([])
onMounted(() => {
  ouvrageServices.getAllCategories().then((res) => {
    categories.value = res.data.data.map((cat) => {
      return {
        id: cat.categorie_id,
        nom: cat.nom,
      }
    })
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
    book.image = file

    if (book.preview) {
      URL.revokeObjectURL(book.preview)
    }
    book.preview = URL.createObjectURL(file)
  }
}

const open = ref(null)
const selected = ref({
  categorie: '',
  author: '',
})

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
const flashMessage = ref({ type: '', message: '' })

const showFlashMessage = (type, message) => {
  flashMessage.value = { type, message }
  setTimeout(() => {
    flashMessage.value = { type: '', message: '' }
  }, 3000)
}

const uploadImage = async () => {
  if (!book.image) {
    console.error('Aucune image sélectionnée.')
    return
  }

  const formData = new FormData()
  formData.append('image', book.image)

  try {
    const response = await ouvrageServices.uploadImage(formData)
    book.image = response.data.filePath
  } catch (error) {
    console.error("Erreur lors de l'upload de l'image :", error)
  }
}

const flashMessageStore = useFlashMessageStore()

const checkValid = async () => {
  await uploadImage()
  const data = {
    titre: book.titre,
    image: book.image,
    nb_pages: Number(book.nb_pages),
    nom_editeur: book.nom_editeur,
    resume: book.resume,
    categorie_fk: Number(selected.value.categorie.id),
    extrait: book.extrait,
    annee_edition: book.annee_edition,
    ecrivain_fk: Number(selected.value.author.id),
  }
  if (!book.titre.trim()) {
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
  if (!book.resume.trim()) {
    champs.resume = false
  } else {
    champs.resume = true
  }
  if (!book.nb_pages) {
    champs.nb_pages = false
  } else {
    champs.nb_pages = true
  }
  if (!book.annee_edition) {
    champs.annee_edition = false
  } else {
    champs.annee_edition = true
  }
  if (!book.nom_editeur.trim()) {
    champs.nom_editeur = false
  } else {
    champs.nom_editeur = true
  }
  if (!book.extrait.trim()) {
    champs.extrait = false
  } else {
    champs.extrait = true
  }
  if (!book.image) {
    champs.image = false
  } else {
    champs.image = true
  }
  if (
    !book.titre.trim() ||
    !book.image ||
    !book.nb_pages ||
    !book.nom_editeur.trim() ||
    !book.resume.trim() ||
    !selected.value.categorie ||
    !book.extrait.trim() ||
    !selected.value.author ||
    !book.annee_edition
  ) {
    flashMessageStore.setFlashMessage('error', 'Veuillez remplir tous les champs obligatoires.')
    return false
  }
  if (
    champs.titre &&
    champs.image &&
    champs.nb_pages &&
    champs.nom_editeur &&
    champs.resume &&
    champs.categorie &&
    champs.extrait &&
    champs.author &&
    champs.annee_edition
  ) {
    flashMessageStore.setFlashMessage('success', 'Livre ajouté avec succès !')
    router.push({ name: 'ouvrages' })
    ouvrageServices.createBook(data).then((res) => {})
    return true
  }
}
</script>
<template>
  <div class="book-detail">
    <div v-if="flashMessageStore.type" :class="['flash-message', flashMessageStore.type]">
      {{ flashMessageStore.message }}
    </div>
    <input type="file" id="fileInput" @change="handleFileUpload" accept="image/*" hidden />
    <label
      for="fileInput"
      :class="['uploadImage', { noBorder: book.preview }, { uploadImageError: !champs.image }]"
    >
      <img v-if="book.preview" :src="book.preview" alt="Image sélectionnée" class="uploadedImage" />
      <img
        v-else
        class="chooseImage"
        src="../../public/images/ajouter-une-image.png"
        alt="ajouter une image"
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
            <div
              class="author-select"
              @click.stop="toggleSelect('author')"
              :class="{ 'editable-inputError': !champs.author }"
            >
              <div class="selectedAuthor" :class="{ selectedAuthorerror: !champs.author }">
                {{ selected.author.nom || 'Auteur' }}
              </div>
              <ul
                class="optionsAuthor"
                v-show="open === 'author'"
                :class="{ optionsAuthorerror: !champs.author }"
              >
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
        <div
          class="custom-select"
          @click.stop="toggleSelect('categorie')"
          :class="{ 'custom-error': !champs.categorie }"
        >
          <div id="categorie" class="selected" :class="{ selectedError: !champs.categorie }">
            {{ selected.categorie.nom || 'Catégorie' }}
          </div>
          <ul
            class="options"
            v-show="open === 'categorie'"
            :class="{ optionsError: !champs.categorie }"
          >
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
      <button class="valid" @click="checkValid">Soumettre</button>
    </div>
  </div>
</template>

<style scoped>
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
.authors {
  display: flex;
  align-items: center;
  justify-content: center;
}
.title_author {
  width: 532px;
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
  transition: all 0.4s ease;
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
  transition: all 0.4s ease;
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
  transition: all 0.4s ease;
}
.custom-error {
  margin-left: 0px;
  background-color: #ffe6e6 !important;
  border: 1px solid #f44336 !important;
  color: #f44336 !important;
}
.selectedAuthor {
  width: 100%;
  padding-right: 50px;
  height: 100%; /* Pour hériter de la hauteur du parent */
  display: flex;
  align-items: center; /* Centre verticalement le texte */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="grey" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 15px center; /* Centre verticalement la flèche */
  background-size: 24px 24px;
}

.selectedAuthorerror {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>');
  background-color: #ffe6e6 !important;
  color: #f44336 !important;
}
.optionsAuthorerror {
  background-color: #ffe6e6 !important;
  border: 1px solid #f44336 !important;
  color: #f44336 !important;
}
.optionsAuthorerror li {
  color: #f44336 !important;
}
.optionsAuthorerror li:hover {
  background-color: #ffa3a3 !important;
  color: #f44336 !important;
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
  height: 100%; /* Pour hériter de la hauteur du parent */
  display: flex;
  align-items: center; /* Centre verticalement le texte */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 15px center; /* Centre verticalement la flèche */
  background-size: 24px 24px;
}

.selectedError {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>');
  background-color: #ffe6e6 !important;
  color: #f44336 !important;
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

.optionsError {
  background-color: #ffe6e6 !important;
  border: 1px solid #f44336 !important;
  color: #f44336 !important;
}

.optionsError li {
  color: #f44336 !important;
}

.optionsError li:hover {
  background-color: #ffa3a3 !important;
  color: #f44336 !important;
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
</style>
