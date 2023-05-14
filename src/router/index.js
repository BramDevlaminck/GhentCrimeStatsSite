import {createRouter, createWebHashHistory} from "vue-router";
import Introduction from "@/views/Introduction.vue";
import About from "@/views/About.vue";
import Statistics from "@/views/Statistics.vue";

const routes = [
    {
        path: "/",
        name: "Introduction",
        component: Introduction,
    },
    {
        path: "/statistics",
        name: "Statistics",
        component: Statistics
    },
    {
        path: "/about",
        name: "About",
        component: About,
    },
];

const router = createRouter({
    history: createWebHashHistory(import.meta.env.VITE_BASE_URL),
    routes,
});

export default router;