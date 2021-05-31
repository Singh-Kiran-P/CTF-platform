import Vue from 'vue';
import axios from 'axios';
import VueRouter from 'vue-router';
import Roles from '@shared/roles';
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
        name: 'Your Team',
        src: 'Team.vue',
    },
    teamDashboard: {
        path: '/team/:uuid',
        name: 'Team Dashboard',
        src: 'TeamDashboard.vue',
        meta: {hidden:true}
    },
    joinTeam: {
        path: '/team/join/:invite',
        name: 'Join Team',
        src: 'JoinTeam.vue',
        meta: { hidden: true }
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
    rounds: {
        path: '/rounds',
        name: 'Rounds',
        src: 'Rounds.vue'
    },
    challenge: {
        path: '/challenge/:id',
        name: 'Challenge',
        src: 'Challenge.vue',
        meta: { hidden: true }
    },
    leaderboard: {
        path: '/leaderboard',
        name: 'Leaderboard',
        src: 'Leaderboard.vue'
    },
    liveFeed: {
        path: '/live-feed',
        name: 'Live Feed',
        src: 'LiveFeed.vue'
    },
    competition: {
        path: '/competition',
        name: 'Competition',
        src: 'Competition.vue',
        meta: { right: true }
    },
    config: {
        path: '/config',
        name: 'Config',
        src: 'Config.vue',
        meta: { right: true }
    },
    docker: {
        path: '/docker',
        name: 'Docker',
        src: 'Docker.vue',
        meta: { right: true }
    },
    notifications: {
        path: '/notifications',
        name: 'Notifications',
        src: 'Notifications.vue',
        meta: { right: true }
    }
};

// define which pages are available to which user type (excluding uploaded pages)
const routes: { [page: string]: Route[] } = {
    [Roles.VISITOR]: [
        pages.login,
        pages.register,
        pages.users,
        pages.teams,
        pages.leaderboard,
        pages.teamDashboard
    ],
    [Roles.PARTICIPANT]: [
        pages.users,
        pages.teams,
        pages.team,
        pages.teamDashboard,
        pages.joinTeam,
        pages.rounds,
        pages.challenge,
        pages.leaderboard,
        pages.notifications,
        pages.logout
    ],
    [Roles.ORGANIZER]: [
        pages.users,
        pages.teams,
        pages.teamDashboard,
        pages.rounds,
        pages.challenge,
        pages.leaderboard,
        pages.liveFeed,
        pages.competition,
        pages.config,
        pages.docker,
        pages.notifications,
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
        routes: [{
            path: '/', meta: { hidden: true }, component: { template: '<router-view/>' },
            children: availableRoutes.map(route => ({
                path: route.path.slice(1),
                name: route.name,
                meta: Object.assign({}, route.meta, { admin: roleResponse.data == Roles.ORGANIZER, auth: roleResponse.data != Roles.VISITOR, toggle: route.src.endsWith('vue') }),
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
