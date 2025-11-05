<script setup>
const props = defineProps({
  titre: {
    required: true,
    type: String,
  },
  comment: {
    required: true,
    type: Boolean,
  },
})
defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h1>Confirmation de la suppression</h1>
      <p>
        Êtes-vous sûr(e) de vouloir supprimer
        <span v-show="comment">ton commentaire qui dis </span> <strong>"{{ titre }}"</strong> ?
      </p>
      <div class="modal-actions">
        <button class="btn confirm" @click="$emit('confirm')">Oui</button>
        <button class="btn cancel" @click="$emit('cancel')">Annuler</button>
      </div>
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

p {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 2rem;
}

strong {
  font-weight: bold;
  color: #e63946;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
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
