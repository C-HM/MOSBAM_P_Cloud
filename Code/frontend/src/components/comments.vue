<script setup>
import { onMounted, ref, computed } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
import router from '@/router'
import Addcomment from './addComment.vue'
import { useRoute } from 'vue-router'
import confirmation from './confirmation.vue'
const emit = defineEmits(['comments-updated'])

const comments = ref([])
const route = useRoute()

const getUser = async (id) => {
  try {
    const data = await ouvrageServices.getUserById(id)
    return data.data.utilisateur.pseudo
  } catch (err) {
    console.error(err)
    return 'Utilisateur inconnu'
  }
}
const currentUserId = getUserIdFromToken()

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

const fetchCommts = async () => {
  try {
    const response = await ouvrageServices.getComments(route.params.id)
    const rawComments = response.data.data

    const updatedComments = await Promise.all(
      rawComments.map(async (comment) => {
        const userName = await getUser(comment.user_fk)
        comment.user = userName
        return comment
      }),
    )

    comments.value = updatedComments
  } catch (err) {
    console.error(err)
  }
}
const userNow = ref('')
onMounted(async () => {
  await ouvrageServices.getUserById(currentUserId).then((res) => {
    userNow.value = res.data.utilisateur
  })
  fetchCommts()
})

const confirm = ref(false)
const createComment = async (comment) => {
  try {
    confirm.value = false
    await ouvrageServices.createComment(route.params.id, comment)
    fetchCommts()
    emit('comments-updated')
  } catch (err) {
    console.error(err)
  }
}

const showConfirmation = () => {
  confirm.value = true
}
const commentId = ref(null)
const commentaireValue = ref({
  titre: '',
})
const showConfirmationDelete = (id, commentaire) => {
  commentaireValue.value.titre = commentaire
  commentId.value = id
  deleteConfirmation.value = true
}
const hideConfirmationDelete = () => {
  deleteConfirmation.value = false
}
const hideConfirmation = () => {
  confirm.value = false
}
const deleteConfirmation = ref(false)

const deleteComment = async (id) => {
  deleteConfirmation.value = false
  try {
    await ouvrageServices.deleteComment(id)
    fetchCommts()
    emit('comments-updated')
  } catch (err) {
    console.error(err)
  }
}

const canUpdate = (id) => {
  if (currentUserId == id || userNow.value.admin) {
    return true
  } else {
    return false
  }
}

const comment = true
</script>

<template>
  <section class="comments-section">
    <div class="comments-header">
      <h1 class="title">Commentaires</h1>
      <button class="create" @click="showConfirmation">Ajouter un commentaire</button>
    </div>
    <p class="commentsError" v-if="comments.length == 0">
      Aucun commentaire n’a encore été publié pour ce livre.
    </p>
    <div class="comments-list">
      <div v-for="comment in comments" :key="comment.evaluation_id" class="comment-card">
        <div class="comment-header">
          <span class="comment-user">{{ comment.user }}</span>
          <span class="comment-note">⭐ {{ comment.note }}/5</span>

          <button
            class="delete-btn"
            @click="showConfirmationDelete(comment.evaluation_id, comment.commentaire)"
          >
            <img
              v-if="canUpdate(comment.user_fk)"
              src="../../public/images/trash-canRed.png"
              alt="Supprimer"
              class="delete-icon"
            />
          </button>
        </div>
        <p class="comment-body">{{ comment.commentaire }}</p>
      </div>
    </div>
  </section>

  <confirmation
    v-show="deleteConfirmation"
    :titre="commentaireValue.titre"
    :comment="comment"
    @confirm="deleteComment(commentId)"
    @cancel="hideConfirmationDelete"
  />
  <Addcomment v-show="confirm" @confirm="createComment" @cancel="hideConfirmation" />
</template>

<style scoped>
.commentsError {
  font-size: 1.15rem;
  color: #e53e3e;
  background: #fff0f0;
  border: 1.5px solid #e53e3e;
  border-radius: 8px;
  padding: 14px 22px;
  margin: 32px auto 24px auto;
  text-align: center;
  max-width: 420px;
  font-weight: 500;
  box-shadow: 0 2px 12px rgba(229, 62, 62, 0.07);
  letter-spacing: 0.2px;
  transition:
    background 0.2s,
    border 0.2s,
    color 0.2s,
    transform 0.2s;
}

.commentsError:hover {
  background: #ffeaea;
  color: #b91c1c;
  border-color: #b91c1c;
  box-shadow: 0 4px 18px rgba(229, 62, 62, 0.13);
  transform: scale(1.04);
}
.delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  transition: transform 0.15s;
}
.delete-btn:hover .delete-icon {
  transform: scale(1.15);
  filter: brightness(0.7);
}
.delete-icon {
  width: 22px;
  height: 22px;
}
.comments-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center; /* centre horizontalement le contenu */
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 0 1rem;
  position: relative; /* pour positionner le bouton */
}
.create {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(90deg, #1d72b8 0%, #2a9d8f 100%);
  color: #fff;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 24px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
  transition:
    background 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
  outline: none;
  margin: 0;
}

.create:hover {
  background: linear-gradient(90deg, #155a96 0%, #21867a 100%);
  transform: translateY(-50%) scale(1.04);
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.15);
}
h1 {
  text-align: center;
}
.comments-section {
  padding: 2rem;
  background-color: #f9f9f9;
}

.title {
  font-size: 2rem;
  color: #1d3557;
  margin: 0;
  padding: 0;
  text-align: center;
  flex: 0 1 auto;
  width: 100%;
}

.comments-list {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 1.5rem;
  scrollbar-color: #1d72b8 #f9f9f9;
  padding-bottom: 16px;
  width: 100%;
  box-sizing: border-box;
}

.comments-list::-webkit-scrollbar {
  height: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}
.comments-list::-webkit-scrollbar-thumb {
  background: #1d72b8;
  border-radius: 8px;
}
.comments-list::-webkit-scrollbar-thumb:hover {
  background: #155a96;
}

.comment-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.25rem;
  min-width: 320px;
  max-width: 350px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
}

.comment-card:hover {
  transform: translateY(-4px);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.comment-user {
  font-weight: bold;
  color: #2a9d8f;
}

.comment-note {
  font-size: 0.9rem;
  color: #f4a261;
}

.comment-body {
  font-size: 1rem;
  color: #333;
  line-height: 1.4;
}

@media (max-width: 700px) {
  .comments-list {
    flex-direction: column;
    flex-wrap: wrap;
    overflow-x: visible;
    gap: 1.2rem;
    padding-bottom: 0;
  }
  .comment-card {
    min-width: unset;
    max-width: 100%;
    width: 100%;
  }
}
</style>
