import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OuvragesView from '@/views/OuvragesView.vue'
import DetailsView from '@/views/DetailsView.vue'
import AddBook from '@/views/AddBookView.vue'
import UpdateBook from '@/views/UpdateBookView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ouvrageServices from '../../services/ouvrageServices'
import UserProfile from '@/views/UserProfile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/ouvrages',
      name: 'ouvrages',
      component: OuvragesView,
    },
    {
      path: '/ouvrages/:id',
      name: 'details',
      component: DetailsView,
    },
    {
      path: '/addBook',
      name: 'addBook',
      component: AddBook,
    },
    {
      path: '/updateBook/:id',
      name: 'updateBook',
      component: UpdateBook,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: UserProfile,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  if (['details', 'addBook', 'updateBook', 'profile'].includes(to.name)) {
    const bookId = to.params.id
    const token = localStorage.getItem('token')
    if (!token) return next('/login')
    const jwt = token.split(' ')[1]
    let userId
    let admin
    try {
      userId = JSON.parse(atob(jwt.split('.')[1])).userId
      admin = JSON.parse(atob(jwt.split('.')[1])).admin
    } catch {
      return next('/login')
    }
    if (['updateBook'].includes(to.name)) {
      try {
        const data = await ouvrageServices.getBookById(bookId)
        if (data.data.ouvrage.user_fk !== userId && admin == false) {
          return next(from.fullPath) // Correction ici
        }
        return next()
      } catch {
        return next(from.fullPath) // Correction ici
      }
    }
    return next()
  } else {
    return next()
  }
})

export default router
