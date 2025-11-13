import { createRouter, createWebHashHistory } from 'vue-router'
import CollectionsView from '../views/CollectionsView.vue'
import CreateEditCollectionView from '../views/CreateEditCollectionView.vue'
import PracticeView from '../views/PracticeView.vue'
import AdminView from '../views/AdminView.vue'
import AddCollectionsView from '../views/AddCollectionsView.vue'
import AdminInstallView from '../views/AdminInstallView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'collections',
      component: CollectionsView
    },
    {
      path: '/collection/new',
      name: 'create-collection',
      component: CreateEditCollectionView
    },
    {
      path: '/collection/:id/edit',
      name: 'edit-collection',
      component: CreateEditCollectionView
    },
    {
      path: '/practice',
      name: 'practice',
      component: PracticeView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    },
    {
      path: '/addCollections',
      name: 'add-collections',
      component: AddCollectionsView
    },
    {
      path: '/install-admin',
      name: 'install-admin',
      component: AdminInstallView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ]
})

export default router
