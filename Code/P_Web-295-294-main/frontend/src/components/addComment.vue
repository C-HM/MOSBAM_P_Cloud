<script setup>
import { ref } from 'vue'
import router from '@/router'
const emit = defineEmits(['confirm', 'cancel'])

const commentaire = ref('')
const note = ref(5)

const submitComment = () => {
  if (commentaire.value.trim() && note.value) {
    emit('confirm', { commentaire: commentaire.value, note: note.value })
    commentaire.value = ''
    note.value = 5
  }
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h1>Création d'un commentaire</h1>
      <form class="comment-form" @submit.prevent="submitComment">
        <label for="note">Note :</label>
        <select id="note" v-model="note" required>
          <option v-for="n in 5" :key="n" :value="n">⭐ {{ n }}</option>
        </select>

        <label for="commentaire">Commentaire :</label>
        <textarea
          id="commentaire"
          v-model="commentaire"
          rows="4"
          placeholder="Votre commentaire..."
          required
        ></textarea>

        <div class="modal-actions">
          <button class="btn confirm" type="submit">Envoyer</button>
          <button class="btn cancel" type="button" @click="$emit('cancel')">Annuler</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(30, 30, 30, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2.5rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
}

h1 {
  font-size: 1.8rem;
  color: #1d3557;
  margin-bottom: 1rem;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  font-weight: 600;
  color: #1d3557;
  text-align: left;
}

select,
textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #bdbdbd;
  padding: 0.7rem;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  resize: none;
}

textarea:focus,
select:focus {
  outline: 2px solid #1d72b8;
  border-color: #1d72b8;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.btn {
  width: 100px;
  padding: 0.75rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition:
    transform 0.2s,
    background-color 0.2s;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: scale(1.05);
}

.confirm {
  background-color: #38a169;
  color: white;
}

.confirm:hover {
  background-color: #2f855a;
}

.cancel {
  background-color: #e53e3e;
  color: white;
}

.cancel:hover {
  background-color: #c53030;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
