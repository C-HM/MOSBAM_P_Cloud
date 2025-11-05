import { defineStore } from 'pinia'

export const useFlashMessageStore = defineStore('flashMessage', {
  state: () => ({
    type: '',
    message: '',
  }),
  actions: {
    setFlashMessage(type, message) {
      this.type = type
      this.message = message
      setTimeout(() => {
        this.clearFlashMessage()
      }, 3000)
    },
    clearFlashMessage() {
      this.type = ''
      this.message = ''
    },
  },
})
