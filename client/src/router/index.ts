import Vue from 'vue';
import axios from 'axios';
import VueRouter from 'vue-router';
import Roles from '@shared/roles';
import Dashboard from '../pages/../components/Teams/Dashboard.vue'
Vue.use(VueRouter);

type Route = { path: string, name: string, src: string, meta?: {} };

// define all pages used in the website
const pages: { [page: string]: Route } = {
    login: {
        path: '/login',
        name: 'Login',
        src: 'Login.vue'
    },
    register: {
        path: '/register',
        name: 'Register',
        src: 'Register.vue'
    },
    logout: {
        path: '/logout',
        name: 'Logout',
        src: 'Logout.vue',
        meta: { right: true }
    },
    team: {
        path: '/team',
        name: 'Team',
        src: 'Team.vue',
    },
    teamDashboard: {
        path: '/team/:uuid',
        name: 'TeamDashboard',
        src: 'TeamDashboard.vue',
        meta: {hidden:true}
    },
    joinTeam: {
        path: '/team/join/:invite',
        name: 'joinTeam',
        src: 'joinTeam.vue',
        meta: {hidden: true}
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
    users: {
        path: '/users',
        name: 'Users',
        src: 'Users.vue'
    },
    config: {
        path: '/config',
        name: 'Config',
        src: 'Config.vue',
        meta: { right: true }
    }
};

// define which pages are available to which user type (excluding uploaded pages)
const routes: { [page: string]: Route[] } = {
    [Roles.VISITOR]: [
        pages.login,
        pages.register,
        pages.joinTeam,
        pages.teamDashboard,
        pages.teams,
        pages.users
    ],
    [Roles.PARTICIPANT]: [
        pages.leaderboard,
        pages.team,
        pages.teamDashboard,
        pages.joinTeam,
        pages.teams,
        pages.users,
        pages.logout
    ],
    [Roles.ORGANIZER]: [
        pages.leaderboard,
        pages.teamDashboard,
        pages.teams,
        pages.users,
        pages.config,
        pages.logout
    ]
};

// retrieve all uploaded pages
Promise.all([
    axios.get('/api/auth/role'),
    axios.get('/api/competition/pages')
]).then(([roleResponse, pagesResponse]) => {
    let availableRoutes: Route[] = pagesResponse.data.map((page: any) => ({
        path: page.path,
        name: page.name,
        src: page.source
    })).concat(routes[roleResponse.data]);

    // PageNotFound shown when no page matches the url
    availableRoutes.push({
        path: '/*',
        name: 'Error 404',
        src: 'PageNotFound.vue',
        meta: { hidden: true }
    });

    const router = new VueRouter({
        mode: 'history',
        routes: [{ path: '/',  meta: { hidden: true }, component: { template: '<router-view/>' },
            children: availableRoutes.map(route => ({
                path: route.path.slice(1),
                name: route.name,
                meta: route.meta,
                component: route.src.endsWith('vue') ? () => import(`../pages/${route.src}`) : { template: `<iframe src="/api/uploads${route.src}"/>` }
                // include vue pages directly into the html using a lazy loaded import, with the root directory for src in '/src/pages/'
                // include html pages using an iframe so they dont inherit any styling, the src requesting the html file from the server
            }))
        }]
    });

    // update the document title to the page name on route
    router.beforeEach((route, _, next) => {
        document.title = route.name?.toString() || route.path;
        next();
    });

    RouterReady.onReady(router);
});

class RouterReady {
    static onReady: (router: VueRouter) => void;
}

export default RouterReady;
