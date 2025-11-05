<script setup>
import { ref, onMounted } from 'vue'
import profileBooks from '@/components/profileBooks.vue'
import profileComment from '@/components/profileComment.vue'
import profileDetails from '@/components/profileDetails.vue'

const userId = getUserIdFromToken()

function getUserIdFromToken() {
  const token = localStorage.getItem('token')
  if (!token) return null
  // Si ton token est du type "Bearer xxx.yyy.zzz", prends la partie après l'espace
  const jwt = token.split(' ').length > 1 ? token.split(' ')[1] : token
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]))
    return payload.id || payload.userId // adapte selon ton backend
  } catch (e) {
    return null
  }
}

onMounted(() => {
  // Ici tu pourrais charger les vraies données utilisateur
})
</script>

<template>
  <h1>Page de Profile</h1>
  <profileDetails :userId="userId" />
  <profileBooks :userId="userId" />
  <profileComment :userId="userId" />
</template>

<style scoped>
h1 {
  text-align: center;
  margin: 20px;
}
.profile-container {
  max-width: 600px;
  margin: 40px auto;
  background: #f5f7fa;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(69, 123, 157, 0.08);
  padding: 32px 24px;
  font-family: 'Segoe UI', Arial, sans-serif;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e7ecef;
  object-fit: cover;
  border: 3px solid #457b9d;
}

.profile-date {
  color: #457b9d;
  font-size: 1rem;
  margin-top: 6px;
}

.profile-section {
  margin-bottom: 28px;
}

.profile-section h3 {
  color: #1d3557;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.profile-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ouvrage-title {
  font-weight: 500;
  color: #222;
}

.comment-ouvrage {
  color: #457b9d;
  font-weight: 500;
}

.comment-text {
  color: #333;
  font-style: italic;
}

.comment-date {
  color: #888;
  font-size: 0.95em;
  margin-left: 8px;
}
</style>
