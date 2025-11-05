<script setup>
import ouvrageServices from '../../services/ouvrageServices'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const pseudo = ref('')
const mdp = ref('')
const confirmMdp = ref('')
const error = ref('')
const success = ref('')
const router = useRouter()

const handleRegister = async () => {
  if (mdp.value !== confirmMdp.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    success.value = ''
    return
  }
  try {
    const newUser = await ouvrageServices.register({ pseudo: pseudo.value, mdp: mdp.value })

    await ouvrageServices.login({ pseudo: pseudo.value, mdp: mdp.value })
    success.value = 'Compte créé avec succès !'
    error.value = ''
    pseudo.value = ''
    mdp.value = ''
    confirmMdp.value = ''
    // Redirection vers la page ouvrage après inscription
    router.push('/ouvrages')
  } catch (e) {
    error.value = 'Erreur lors de la création du compte.'
    success.value = ''
  }
}
</script>

<template>
  <form @submit.prevent="handleRegister">
    <label for="username">Nom d'utilisateur: </label>
    <input
      type="text"
      required
      id="username"
      name="username"
      placeholder="Entrer le nom d'utilisateur"
      v-model="pseudo"
    />

    <label for="password">Mot de passe: </label>
    <input
      type="password"
      required
      id="password"
      name="password"
      placeholder="Entrer le mot de passe"
      v-model="mdp"
    />

    <label for="confirmationpassword">Confirmer le mot de passe: </label>
    <input
      type="password"
      required
      id="confirmationpassword"
      name="confirmationpassword"
      placeholder="Entrer à nouveau le mot de passe"
      v-model="confirmMdp"
    />

    <input type="submit" value="Créer" />
    <p v-if="error" style="color: red">{{ error }}</p>
    <p v-if="success" style="color: green">{{ success }}</p>
    <p>
      Déjà un compte?
      <a href="/login">Se connecter</a>
    </p>
  </form>
</template>

<style scoped>
form {
  width: 400px;
  margin: 60px auto;
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
  width: 100%;
  margin-bottom: 10px;
  box-sizing: border-box;
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
