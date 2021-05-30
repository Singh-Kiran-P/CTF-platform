<template>
    <div id=pageBar>
        <b-navbar toggleable=sm type=dark variant=dark>
            <b-navbar-toggle target=nav-collapse />
            <b-navbar-brand>
                <span id=name @click="home($event)">{{name}}</span>
                <b-button type=button class=toggle-dark @click="toggleDark()">
                    <font-awesome-icon :icon="dark ? 'moon' : 'sun'" />
                </b-button>
            </b-navbar-brand>
            
            <b-collapse id=nav-collapse is-nav>
                <b-navbar-nav>
                    <b-nav-item v-for="page in pages.left" :key="page.path" :to="page.path">{{page.name}}</b-nav-item>
                </b-navbar-nav>

                <b-navbar-nav class="ml-auto">
                    <b-nav-item v-for="page in pages.right" :key="page.path" :to="page.path">{{page.name}}</b-nav-item>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import IconButton from '@/components/IconButton.vue';

export default Vue.extend({
    name: 'PageBar',
    components: {
        IconButton
    },
    created() { // store all available routes in pages
        this.$router.getRoutes().forEach(route => {
            if (route.meta?.hidden) return;
            const page = {
                name: route.name?.toString() || route.path.toString(),
                path: route.path.toString(),
            };
            route.meta?.right ? this.pages.right.push(page) : this.pages.left.push(page);
        });

        axios.get('/api/darkMode/state').then(res => {
            this.dark = res.data;
            this.setMode();
        });

        axios.get('/api/competition/name').then(res => {
            if (res.data.error) return;
            this.name = res.data;
        });
    },
    data: () => ({
        pages: { left: [] as { path: string, name: string }[], right: [] as { path: string, name: string }[] },
        dark: true,
        name: ''
    }),
    methods: {
        home(e: MouseEvent) {
            e?.ctrlKey ? window.open('/', '_blank') : this.$router.push('/');
        },

        toggleDark(): void {
            axios.get('/api/darkMode/toggle').then(res => {
                this.dark = res.data;
                this.setMode();
            });
        },

        setMode(): void {
            const style = getComputedStyle(document.documentElement);
            const get = (prop: string) => style.getPropertyValue('--' + prop);
            const set = (prop: string, val: any) => document.documentElement.style.setProperty('--' + prop, val);
            let props = ['white', 'black', 'gray', 'gray-light', 'gray-lightest', 'gray-half'];
            let noTransition = 'no-transition';
            document.body.classList.add(noTransition);
            props.forEach(prop => set(prop + '-c', get(prop + (this.dark ? '-d' : '-l'))));
            document.body.classList.remove(noTransition);
        }
    }
});
</script>

<style scoped lang="scss">
.navbar-brand {
    #name {
        cursor: pointer;
        color: var(--white-l);
    }
    
    button {
        border: none;
        color: var(--white-l);
        padding: 0 var(--margin);
        margin: 0 var(--margin);

        &:not(:focus) {
            background-color: transparent;
        }
    }
}

@media (hover: hover) {
    a.router-link-exact-active, a:hover, a:focus-visible {
        color: var(--primary) !important;
    }
}

a.router-link-exact-active {
    color: var(--primary) !important;
}

.navbar-brand {
    margin-right: var(--double-margin);
}

.navbar, .navbar-brand, .navbar-collapse {
    flex-wrap: wrap;
    max-width: 100%;
    white-space: initial;
    word-wrap: break-word;
}

.navbar-nav {
    overflow-x: auto;
}

.navbar-nav:not(:last-of-type) {
    padding-right: var(--double-margin);
}

.nav-item:first-of-type .nav-link {
    padding-left: 0;
}

.nav-item:last-of-type .nav-link {
    padding-right: 0;
}
</style>
