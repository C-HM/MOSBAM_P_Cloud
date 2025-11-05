<script setup>
import { ref, onMounted } from 'vue'
import ouvrageServices from '../../services/ouvrageServices'
import booksCard from '@/components/booksCard.vue'
const props = defineProps({
  userId: {
    required: true,
    type: Int32Array,
  },
})
const bookUser = ref([])

onMounted(() => {
  ouvrageServices.getBookUserById(props.userId).then((data) => {
    bookUser.value = data.data.data
  })
})
</script>
<template>
  <div class="profile-section">
    <div>
      <h3>Ouvrages postés ({{ bookUser.length }})</h3>
    </div>
    <div class="booksCard" v-if="bookUser.length > 0">
      <booksCard
        v-for="book in bookUser"
        :key="book.ouvrage_id"
        :book="book"
        :userId="props.userId"
      />
    </div>
  </div>
</template>

<style scoped>
.profile-section {
  margin: 40px auto;
  background: linear-gradient(135deg, #f5f7fa 70%, #e4ebf1 100%);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(69, 123, 157, 0.13);
  padding: 38px 28px;
  max-width: 1200px;
  width: 95vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.profile-section h3 {
  color: #1d3557;
  margin-bottom: 32px;
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
  flex-wrap: wrap;
  gap: 40px;
  justify-content: center;
  width: 100%;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(69, 123, 157, 0.1);
  padding: 28px 40px;
  margin-bottom: 36px;
  transition:
    box-shadow 0.22s,
    transform 0.18s;
  position: relative;
}

.booksCard:hover {
  box-shadow: 0 10px 28px rgba(69, 123, 157, 0.18);
  transform: translateY(-2px) scale(1.012);
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
}
</style>
