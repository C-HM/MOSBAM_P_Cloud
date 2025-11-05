<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref, computed, onMounted, reactive } from 'vue'
import router from './router'

const showPopup = ref(false)

const isLogged = computed(() => {
  const token = localStorage.getItem('token')
  if (!token) return false
  const jwt = token.split(' ')[1]
  let userId
  let admin
  try {
    userId = JSON.parse(atob(jwt.split('.')[1])).userId
    admin = JSON.parse(atob(jwt.split('.')[1])).admin
    return true
  } catch (e) {
    return false
  }
})

function togglePopup() {
  showPopup.value = !showPopup.value
}

function closePopup() {
  showPopup.value = false
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!(e.target.closest('.login-link') || e.target.closest('.user-popup'))) {
      showPopup.value = false
    }
  })
})

const logout = async () => {
  localStorage.removeItem('token')
  console.log('Déconnexion réussie')
  showPopup.value = false
}
</script>

<template>
  <div class="layout">
    <header>
      <div class="container">
        <a href="/">
          <img src="/images/passionLecture.png" alt="Logo Passion Lecture" />
        </a>
        <nav>
          <RouterLink class="navigation" to="/">Home</RouterLink>
          <RouterLink class="navigation" to="/ouvrages">Ouvrages</RouterLink>
        </nav>
        <div class="login-link" @click.stop="togglePopup">
          <img class="login-img" src="/images/user-interfaceBlack.png" alt="login" />
          <div v-if="showPopup" class="user-popup">
            <RouterLink @click.stop="closePopup" v-if="isLogged" to="/profile"
              >Mon profil</RouterLink
            >
            <RouterLink class="logout" to="/login" @click.stop="logout" v-if="isLogged"
              >Déconnexion</RouterLink
            >
            <RouterLink v-else to="/login" @click.stop="closePopup">Connexion</RouterLink>
          </div>
        </div>
      </div>
    </header>

    <div class="main-content">
      <RouterView />
    </div>

    <footer class="footer">
      <div class="container footer-container">
        <div class="footer-logo">
          <img src="/images/passionLecture.png" alt="Logo Passion Lecture" />
        </div>
        <div class="footer-center">
          <a class="footer-contact" href="mailto:pt22ugm@eduvaud.ch">Contact</a>
          <p class="footer-credits">
            &copy; 2025 Passion Lecture. Tous droits réservés.<br />
            Evan · Diego · Mathieu
          </p>
        </div>
        <div class="footer-empty"></div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.main-content {
  flex: 1;
}

.user-popup .logout {
  font-size: 1.1rem;
  font-family: inherit;
  background: none;
  border: none;
  color: #c0392b;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s;
  padding: 4px 8px;
  height: 36px;
}

.user-popup .logout:hover {
  background: #ffeaea;
  color: #e74c3c;
  text-decoration: none;
}

.login-link {
  display: flex;
  align-items: center;
  margin-left: 0;
  margin-right: 20px;
  position: relative;
  cursor: pointer;
}

.user-popup {
  position: absolute;
  top: 48px;
  right: 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(44, 62, 80, 0.13);
  padding: 16px 24px;
  width: 200px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 1.1rem;
  color: #1d3557;
  animation: fadeIn 0.18s;
}

.user-popup a {
  color: #1d3557;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  border-radius: 6px;
  padding: 4px 8px;
}

.user-popup a:hover {
  background: #e7ecef;
  color: #457b9d;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  border-radius: 50%;
  margin-left: 10px;
  transition:
    box-shadow 0.2s,
    opacity 0.2s;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
  position: relative;
  z-index: 1;
}

.login-link {
  position: relative;
}

.login-link .login-img {
  position: relative;
  z-index: 2;
}

.login-link::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: url('/images/user-interfaceBlue.png') center/contain no-repeat;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  border-radius: 50%;
  z-index: 3;
}

.login-link:hover .login-img {
  opacity: 0;
}

.login-link:hover::after {
  opacity: 1;
}
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
img {
  width: 100px;
  align-self: flex-end;
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
#layout {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  flex: 1;
  display: flex;
  justify-content: center;
  text-align: center;
  margin-left: 20px;
}

.navigation {
  font-size: 22px;
  text-decoration: none;
  color: #1d3557;
  position: relative;
  padding: 5px 18px;
  border-radius: 8px 8px 0 0;
  transition:
    color 0.3s cubic-bezier(0.4, 2, 0.6, 1),
    background 0.3s cubic-bezier(0.4, 2, 0.6, 1),
    box-shadow 0.3s cubic-bezier(0.4, 2, 0.6, 1),
    transform 0.25s cubic-bezier(0.4, 2, 0.6, 1);
  overflow: hidden;
  z-index: 1;
}

.navigation:hover {
  color: #fff;
  background: linear-gradient(90deg, #457b9d 0%, #a8dadc 100%);
  box-shadow: 0 8px 24px rgba(69, 123, 157, 0.18);
  transform: scale(1.07);
}

.navigation::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%) scaleX(0);
  width: 90%;
  height: 4px;
  background: linear-gradient(90deg, #457b9d 0%, #a8dadc 100%);
  border-radius: 2px;
  transition: transform 0.35s cubic-bezier(0.4, 2, 0.6, 1);
  z-index: -1;
}

.navigation:hover::before {
  transform: translateX(-50%) scaleX(1);
}

.navigation:hover::after {
  width: 100%; /* La ligne s'étend sur toute la largeur au survol */
}

h2 {
  font-size: 20px;
}

header {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #e7ecef;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.13);
  text-align: center;
  box-sizing: border-box;
}

.footer {
  background-color: #e7ecef;
  color: #1d3557;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.13);
  margin-top: 40px;
  width: 100%;
  padding: 0;
}
.footer-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 6px;
}

.footer-contact {
  color: #1d3557;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  margin-bottom: 2px;
  transition: color 0.2s;
}

.footer-contact:hover {
  color: #457b9d;
  text-decoration: underline;
}

.footer-credits {
  text-align: center;
  font-size: 1rem;
  opacity: 0.85;
  margin: 0;
}

.footer-empty {
  width: 60px;
}

@media (max-width: 700px) {
  .footer-container {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 18px 8px;
  }
  .footer-center {
    align-items: center;
  }
  .footer-empty {
    display: none;
  }
}
</style>
