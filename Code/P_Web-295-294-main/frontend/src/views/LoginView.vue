<script setup>
import ouvrageServices from '../../services/ouvrageServices'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const pseudo = ref('')
const mdp = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    await ouvrageServices.login({ pseudo: pseudo.value, mdp: mdp.value })
    router.push('/ouvrages')
  } catch (e) {
    error.value = "Nom d'utilisateur ou mot de passe incorrect"
  }
}
</script>

<template>
  <div class="login-center">
    <form @submit.prevent="handleLogin">
      <label for="Username">Username: </label>
      <input
        type="text"
        required
        id="Username"
        name="username"
        placeholder="Entrer le nom d'utilisateur"
        v-model="pseudo"
      />
      <label for="Password">Password: </label>
      <input
        type="password"
        required
        id="Password"
        name="password"
        placeholder="Entrer le mot de passe"
        v-model="mdp"
      />
      <input type="submit" value="Submit" />
      <p v-if="error" style="color: red">{{ error }}</p>
      <p>
        Pas encore de compte ?
        <a href="/register">Créer un compte</a>
      </p>
    </form>
  </div>
</template>

<style scoped>
.login-center {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
form {
  max-width: 400px;
  margin: 0 auto;
  padding: 32px 28px 28px 28px;
  background: #f7fbfc;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(69, 123, 157, 0.1);
  display: flex;
  flex-direction: column;
  gap: 18px;
  border: 1.5px solid #a3cef1;
}

form label {
  font-weight: 600;
  color: #1d3557;
  margin-bottom: 6px;
  font-size: 16px;
  letter-spacing: 0.5px;
}

form input[type='text'],
form input[type='password'] {
  padding: 11px 14px;
  border: 1.5px solid #bcdff1;
  border-radius: 7px;
  font-size: 16px;
  background: #fff;
  color: #1d3557;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
}

form input[type='text']:focus,
form input[type='password']:focus {
  outline: none;
  border-color: #457b9d;
  box-shadow: 0 0 0 3px rgba(69, 123, 157, 0.13);
}

form input[type='submit'] {
  background: linear-gradient(90deg, #457b9d 0%, #1d3557 100%);
  color: #fff;
  font-weight: 700;
  padding: 13px 0;
  border: none;
  border-radius: 7px;
  font-size: 17px;
  cursor: pointer;
  margin-top: 8px;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(69, 123, 157, 0.1);
  transition: background 0.3s;
}

form input[type='submit']:hover {
  background: linear-gradient(90deg, #6096ba 0%, #457b9d 100%);
}

p {
  text-align: center;
  margin-top: 22px;
  font-size: 15px;
  color: #1d3557;
}

p a {
  color: #457b9d;
  text-decoration: none;
  font-weight: 700;
  padding-left: 4px;
  transition: color 0.2s;
}

p a:hover {
  color: #1d3557;
  text-decoration: underline;
}

p[style] {
  margin-top: 12px;
  font-weight: 600;
  color: #e63946 !important;
  text-align: center;
  letter-spacing: 0.2px;
  background: #fff0f3;
  border-radius: 6px;
  padding: 7px 0;
}
</style>
