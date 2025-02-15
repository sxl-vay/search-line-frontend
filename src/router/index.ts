import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import IndexPage from "../pages/IndexPage.vue";
import FilePage from "../pages/FilePage.vue";
import LoginPage from "../pages/LoginPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: IndexPage,
  },
  {
    path: "/:category",
    component: IndexPage,
  },
  {
    path: "/file",
    component: FilePage,
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem("token") !== null;
  if (to.meta.requiresAuth && !isLoggedIn) {
    next("/login");
  } else {
    next();
  }
});

export default router;
