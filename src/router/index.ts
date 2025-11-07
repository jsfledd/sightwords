import { createRouter, createWebHistory } from 'vue-router'
import CollectionsView from '../views/CollectionsView.vue'
import CreateEditCollectionView from '../views/CreateEditCollectionView.vue'
import PracticeView from '../views/PracticeView.vue'
import AdminView from '../views/AdminView.vue'
import AddCollectionsView from '../views/AddCollectionsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
    }
  ]
})

export default router
