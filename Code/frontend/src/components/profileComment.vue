<script setup>
import { onMounted, ref } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
import confirmation from './confirmation.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  userId: {
    required: true,
    type: [Number, String],
  },
})

const fetchComments = () => {
  ouvrageServices
    .getUserComments(props.userId)
    .then((res) => {
      const comments = res.data.data || []

      const commentsByBook = {}

      for (const comment of comments) {
        if (!commentsByBook[comment.ouvrage_fk]) commentsByBook[comment.ouvrage_fk] = []
        commentsByBook[comment.ouvrage_fk].push(comment)
      }

      if (Object.keys(commentsByBook).length === 0) {
        bookComments.value = []
        return
      }

      const promises = Object.keys(commentsByBook).map((ouvrageId) => {
        return ouvrageServices.getBookById(ouvrageId).then((bookRes) => ({
          book: bookRes.data.ouvrage,
          comments: commentsByBook[ouvrageId],
        }))
      })

      Promise.all(promises)
        .then((results) => {
          bookComments.value = results
        })
        .catch((err) => {
          console.error(err)
        })
    })
    .catch((err) => {
      console.error(err)
    })
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
const deleteConfirmation = ref(false)

const deleteComment = async (id) => {
  deleteConfirmation.value = false
  try {
    await ouvrageServices.deleteComment(id)
    await fetchComments()
  } catch (err) {
    console.error(err)
  }
}

// Formatage de la date
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-CH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const bookComments = ref([]) // [{ book, comments: [...] }]

onMounted(() => {
  fetchComments()
})
function goToBook(ouvrageId) {
  router.push(`/ouvrages/${ouvrageId}`)
}
</script>

<template>
  <div class="profile-section">
    <h3 class="profile-title">
      Commentaires postés ({{ bookComments.reduce((acc, bc) => acc + bc.comments.length, 0) }})
    </h3>

    <div
      class="booksCard"
      v-for="bc in bookComments"
      :key="bc.book.ouvrage_id"
      @click="goToBook(bc.book.ouvrage_id)"
    >
      <img :src="`http://localhost:3000${bc.book.image}`" alt="image de couverture" />
      <div class="book-info">
        <p class="book-title">{{ bc.book.titre }}</p>
        <ul class="profile-list">
          <li v-for="comment in bc.comments" :key="comment.evaluation_id">
            <span class="comment-note">⭐ {{ comment.note }}/5</span>
            <span class="comment-text">"{{ comment.commentaire }}"</span>
            <span class="comment-date">({{ formatDate(comment.createdAt) }})</span>
            <img
              src="/images/trash-canRed.png"
              alt="Supprimer le commentaire"
              @click.stop="showConfirmationDelete(comment.evaluation_id, comment.commentaire)"
            />
          </li>
        </ul>
      </div>
    </div>
  </div>

  <confirmation
    v-show="deleteConfirmation"
    :titre="commentaireValue.titre"
    :comment="comment"
    @confirm="deleteComment(commentId)"
    @cancel="hideConfirmationDelete"
  />
</template>

<style scoped>
.profile-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  margin: 40px auto;
  background: linear-gradient(135deg, #f5f7fa 70%, #e4ebf1 100%);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(69, 123, 157, 0.13);
  padding: 38px 28px;
  max-width: 1200px;
  width: 95vw;
}

.profile-section h3 {
  margin: 0 auto 32px auto;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 1px;
  font-weight: 700;
  background: #e7ecef;
  padding: 8px 24px;
  border-radius: 10px;
  display: inline-block;
  box-shadow: 0 2px 8px rgba(69, 123, 157, 0.08);
}

.booksCard {
  display: flex;
  align-items: flex-start;
  gap: 40px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(69, 123, 157, 0.1);
  margin-bottom: 36px;
  padding: 28px 40px;
  transition:
    box-shadow 0.22s,
    transform 0.18s;
  position: relative;
  width: 100%;
}

.booksCard:hover {
  box-shadow: 0 10px 28px rgba(69, 123, 157, 0.18);
  transform: translateY(-2px) scale(1.012);
}

.booksCard > img {
  width: 120px;
  height: 180px;
  object-fit: cover;
  border-radius: 10px;
  background: #e7ecef;
  box-shadow: 0 2px 8px rgba(69, 123, 157, 0.1);
  border: 2px solid #e7ecef;
  transition: border 0.2s;
}

.booksCard > img:hover {
  border: 2px solid #457b9d;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.book-title {
  font-weight: 700;
  color: #1d3557;
  margin: 0 0 10px 0;
  font-size: 1.22rem;
  letter-spacing: 0.5px;
}

.profile-list {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
}

.profile-list li {
  margin-bottom: 14px;
  background: linear-gradient(90deg, #e7ecef 80%, #f5f7fa 100%);
  border-radius: 7px;
  padding: 14px 22px;
  color: #222;
  font-size: 1.08rem;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  box-shadow: 0 1px 4px rgba(69, 123, 157, 0.06);
  transition: background 0.18s;
  width: 100%;
}

.profile-list li:hover {
  background: linear-gradient(90deg, #dbe9fa 80%, #e4ebf1 100%);
}

.comment-note {
  font-size: 1.08rem;
  color: #ff9800;
  font-weight: 600;
  margin-right: 8px;
  letter-spacing: 0.5px;
}

.comment-text {
  color: #457b9d;
  font-style: italic;
  margin-right: 12px;
  font-size: 1.08rem;
  flex: 1;
  word-break: break-word;
}

.comment-date {
  color: #888;
  font-size: 0.97em;
  margin-left: 4px;
  min-width: 120px;
  text-align: right;
}

.profile-list img {
  width: 26px;
  height: 26px;
  margin-left: 18px;
  cursor: pointer;
  transition:
    filter 0.2s,
    transform 0.2s,
    background 0.2s;
  filter: grayscale(0.3) brightness(0.95);
  opacity: 0.7;
  padding: 4px;
  border-radius: 50%;
}

.profile-list img:hover {
  filter: none;
  opacity: 1;
  transform: scale(1.18) rotate(-12deg);
  background: #ffeaea;
  box-shadow: 0 2px 8px #ffbdbd55;
}

@media (max-width: 1100px) {
  .profile-section {
    max-width: 98vw;
    padding: 18px 4px;
  }
  .booksCard {
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    gap: 16px;
  }
  .booksCard > img {
    width: 90px;
    height: 130px;
  }
  .book-info {
    align-items: center;
    text-align: center;
    width: 100%;
  }
  .profile-list li {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    width: 100%;
  }
  .profile-list img {
    margin-left: 0;
    align-self: flex-end;
  }
}
</style>
