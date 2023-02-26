import { createRouter, createWebHistory } from 'vue-router'
export default createRouter({
  base: import.meta.env.BASE_URL,
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "HomePage",
      component: () => import("@/views/HomePage.vue")
    },
    {
      path: "/:title",
      name: "Seasons",
      component: () => import("@/views/Seasons.vue")
    }
  ]
})