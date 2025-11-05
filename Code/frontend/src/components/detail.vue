<script setup>
import { onMounted, ref, computed, watch, defineExpose } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
import { useFlashMessageStore } from '@/stores/flashMessage'
import router from '@/router'
import confirmation from './confirmation.vue'

const props = defineProps({
  book: {
    type: Array,
    required: true,
  },
})

const book = props.book.ouvrage
const categorie = props.book.categories
const author = props.book.écrivain
const currentUserId = getUserIdFromToken()
const user = ref('')
const userNow = ref('')
const notes = ref([])

onMounted(() => {
  ouvrageServices.getUserById(book.user_fk).then((res) => {
    user.value = res.data.utilisateur
  })
  ouvrageServices.getUserById(currentUserId).then((res) => {
    userNow.value = res.data.utilisateur
  })
  ouvrageServices.getComments(book.ouvrage_id).then((res) => {
    notes.value = res.data.data.map((e) => e.note)
  })
})

function reloadNotes() {
  ouvrageServices.getComments(book.ouvrage_id).then((res) => {
    notes.value = res.data.data.map((e) => e.note)
  })
}

defineExpose({ reloadNotes })

function getUserIdFromToken() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    // Le token est sous la forme "Bearer <jwt>", il faut extraire la partie JWT
    const jwt = token.split(' ')[1]
    const payload = JSON.parse(atob(jwt.split('.')[1]))
    return payload.userId
  } catch (e) {
    return null
  }
}

const moyenneNote = computed(() => {
  if (!notes.value.length) return null
  const sum = notes.value.reduce((acc, n) => acc + n, 0)
  return (sum / notes.value.length).toFixed(1)
})

const formattedDate = new Date(book.annee_edition).toLocaleDateString('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
const link = `/updateBook/${book.ouvrage_id}`
const deleteBook = () => {
  ouvrageServices
    .deleteBook(book.ouvrage_id)
    .then((_) => {
      useFlashMessageStore().setFlashMessage(
        'success',
        `Le livre "${book.titre}" a bien été supprimé.`,
      )
      router.back()
    })
    .catch((err) => {
      console.error(err)
      useFlashMessageStore().setFlashMessage(
        'error',
        `La supression du livre a échoué ! Réessayez dans un instant.`,
      )
      setTimeout(() => {
        useFlashMessageStore().clearFlashMessage()
      }, 3000)
    })
  if (useFlashMessageStore().type == 'error') {
  }
}
const confirm = ref(false)
const showConfirmation = () => {
  confirm.value = true
}
const hideConfirmation = () => {
  confirm.value = false
}

const canUpdate = computed(() => {
  if (currentUserId == book.user_fk || userNow.value.admin) {
    return true
  } else {
    return false
  }
})
</script>

<template>
  <div v-if="useFlashMessageStore().type" :class="['flash-message', useFlashMessageStore().type]">
    {{ useFlashMessageStore().message }}
  </div>
  <div class="book-detail">
    <span v-if="moyenneNote !== null" class="moyenne-note"> ⭐ {{ moyenneNote }}/5 </span>
    <img
      :src="`http://localhost:3000${props.book.ouvrage.image}`"
      :alt="`Couverture de ${book.titre}`"
      class="cover"
    />

    <div class="info">
      <div class="title">
        <div>
          <h2>
            {{ book.titre }}
          </h2>
          <p class="authorCss"><strong>Par</strong> {{ author }}</p>
        </div>
        <p class="caseCat">{{ categorie }}</p>
      </div>
      <p><strong>Résumé:</strong> {{ book.resume }}</p>
      <p><strong>Nombre de pages:</strong> {{ book.nb_pages }}</p>
      <p><strong>Année d'édition:</strong> {{ formattedDate }}</p>
      <p><strong>Éditeur:</strong> {{ book.nom_editeur }}</p>

      <p><strong>Ajouté par: </strong> {{ user.pseudo }}</p>
      <a :href="`/pdfs/${book.extrait}`" target="_blank" class="extrait-link">Voir un extrait</a>

      <div v-if="canUpdate" class="editDelete">
        <RouterLink :to="link" class="editOuvrage">
          <img src="/images/editUpdate.png" alt="edit"
        /></RouterLink>
        <a class="deleteOuvrage"
          ><img src="/images/trash-can.png" alt="delete" @click="showConfirmation"
        /></a>
      </div>
    </div>
  </div>
  <confirmation
    v-show="confirm"
    :titre="book.titre"
    @confirm="deleteBook"
    @cancel="hideConfirmation"
  />
</template>

<style>
.caseCat {
  display: inline-block;
  font-weight: 600;
  font-size: 0.95rem;
  transition: transform 0.2s ease;
  cursor: default;
}

.caseCat:hover {
  transform: scale(1.1);
}

.editOuvrage,
.deleteOuvrage {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.editOuvrage:hover,
.deleteOuvrage:hover {
  transform: scale(1.15);
}

.editOuvrage img,
.deleteOuvrage img {
  width: 28px;
  height: 28px;
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
</style>

<style scoped>
.moyenne-note {
  position: absolute;
  top: 18px;
  left: 18px;
  display: inline-flex;
  align-items: center;
  background-color: #fff8e1;
  color: #f5b301;
  font-size: 18px;
  font-weight: bold;
  padding: 4px 10px;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(245, 179, 1, 0.25);
  gap: 6px;
  transition: transform 0.2s ease;
  z-index: 2;
}

.moyenne-note:hover {
  transform: scale(1.05);
}
.editDelete {
  margin-top: 40px;
  display: flex;
  justify-content: end;
}
.editDelete a img {
  cursor: pointer;
  margin-right: 12px;
  width: 40px;
  height: auto;
}
.caseCat {
  padding: 5px 10px;
  background-color: #1d72b8;
  color: white;
  font-size: 14px;
  font-weight: bold;
  border-radius: 12px;
  height: 42px;
  text-align: center;
  align-items: center;
}
.title {
  display: flex;
  justify-content: space-between;
}
.book-detail {
  position: relative; /* Ajouté pour le positionnement absolute de .moyenne-note */
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  max-width: 1000px;
  margin: 40px auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.cover {
  max-width: 320px;
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 12px;
}

.info h2 {
  font-size: 35px;
  color: #1e1e1e;
  margin: 0; /* Supprime toute marge */
  line-height: 1.1; /* Rapproche la ligne suivante */
}

.authorCss {
  margin: 0; /* Supprime aussi toute marge */
  font-size: 17px;
  color: #555;
  font-style: italic;
  line-height: 1.1;
}

.info p {
  font-size: 17.5px;
  line-height: 1.6;
}

strong {
  color: #222;
}

.extrait-link {
  align-self: flex-start;
  margin-top: 20px;
  padding: 10px 18px;
  background-color: #1d72b8;
  color: white;
  text-decoration: none;
  font-weight: 500;
  border-radius: 6px;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.extrait-link:hover {
  background-color: #155a96;
  transform: scale(1.05);
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
