import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

type Route = { path: string, name: string, src: string, meta?: {} };

// define all pages used in the website
const pages: { [page: string]: Route } = {
    login: {
        path: '/login',
        name: 'Login',
        src: 'Login.vue'
    },
    leaderboard: {
        path: '/leaderboard',
        name: 'Leaderboard',
        src: 'Leaderboard.vue'
    },
    teams: {
        path: '/teams',
        name: 'Teams',
        src: 'Teams.vue'
    },
    adminPanel: {
        path: '/adminPanel',
        name: 'Admin Panel',
        src: 'AdminPanel.vue',
        meta: { right: true }
    }
};

// html pages uploaded by the organizer, these are available to all users
// TODO: retrieve these pages from the database instead (make sure theres a page with path '/')
// TODO: make pages not available to all users?
const uploadedPages: Array<Route> = [
    {
        path: '/',
        name: 'Test',
        src: 'test.html'
    }
];

// define which pages are available to which user type (excluding uploaded pages)
const routes: { [page: string]: Array<Route> } = {
    visitor: [
        pages.login
    ],
    participant: [
        pages.leaderboard,
        pages.teams
    ],
    organizer: [
        pages.leaderboard,
        pages.teams,
        pages.adminPanel
    ]
};

// TODO: choose available routes based on user type (visitor, participant or organizer)
const availableRoutes: Array<Route> = routes.organizer;

// PageNotFound shown when no page matches the url
availableRoutes.push({
    path: '/:catchAll(.*)*',
    name: 'Error 404',
    src: 'PageNotFound.vue',
    meta: { hidden: true }
});

const router = new VueRouter({
    routes: uploadedPages.concat(availableRoutes).map(route => ({ // always add all uploaded pages to the front of the routes list
        path: route.path,
        name: route.name,
        meta: route.meta,
        component: route.src.endsWith('vue') ? () => import(`../pages/${route.src}`) : { template: `<iframe src="pages/${route.src}"/>` }
        // include vue pages directly into the html using a lazy loaded import, with the root directory for src in '/src/pages/'
        // include html pages using an iframe so they dont inherit any styling, with the root directory for src in '/public/pages/'
    }))
});

// update the document title to the page name on route
router.beforeEach((route, _, next) => {
    document.title = route.name?.toString() || route.path;
    next();
});

export default router;
