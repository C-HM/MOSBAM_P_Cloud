<script setup>
import { onMounted, ref } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'

const props = defineProps({
  userId: {
    required: true,
    type: Int32Array,
  },
})

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-CH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const user = ref({})

onMounted(() => {
  ouvrageServices
    .getUserById(props.userId)
    .then((data) => {
      user.value = data.data.utilisateur
    })
    .catch((err) => {
      console.error(err)
    })
})
</script>

<template>
  <div class="profile-header">
    <img class="profile-avatar" src="/images/user-interfaceBlack.png" alt="Avatar utilisateur" />
    <div>
      <h2>{{ user.pseudo }}</h2>
      <p class="profile-date">Membre depuis le {{ formatDate(user.createdAt) }}</p>
    </div>
  </div>
</template>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  background: linear-gradient(135deg, #f5f7fa 70%, #e4ebf1 100%);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(69, 123, 157, 0.13);
  padding: 28px 32px;
  margin: 32px auto 24px auto;
  max-width: 500px;
}

.profile-header h2 {
  margin: 0 0 8px 0;
  color: #1d3557;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.profile-date {
  color: #457b9d;
  font-size: 1.05rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.2px;
  background: #e7ecef;
  padding: 5px 14px;
  border-radius: 8px;
  display: inline-block;
}

@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 18px 10px;
    gap: 14px;
    max-width: 98vw;
  }
  .profile-avatar {
    width: 60px;
    height: 60px;
  }
  .profile-header h2 {
    font-size: 1.15rem;
  }
}
</style>
