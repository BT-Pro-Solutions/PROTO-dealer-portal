import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'
import './styles/portals.css'
import './styles/base.css'
import './styles/pages.css'
import './styles/motion.css'
import './styles/shared/login.css'
import './styles/shared/layout.css'

createApp(App).use(router).mount('#app')
