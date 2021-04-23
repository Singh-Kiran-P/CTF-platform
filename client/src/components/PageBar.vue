<template>
    <div id=pageBar>
        <b-navbar toggleable=sm type=dark variant=dark>
            <b-navbar-toggle target=nav-collapse />
            
            <b-collapse id=nav-collapse is-nav>
                <b-navbar-nav>
                    <b-nav-item v-for="page in pages.left" :key="page.path" :to="page.path">
                        {{page.name}}
                    </b-nav-item>
                </b-navbar-nav>

                <b-navbar-nav class=ml-auto>
                    <b-nav-item v-for="page in pages.right" :key="page.path" :to="page.path">
                        {{page.name}}
                    </b-nav-item>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'PageBar',
    created() { // store all available routes in pages
        this.$router.getRoutes().forEach(route => {
            if (route.meta?.hidden) return;
            const page = {
                name: route.name?.toString() || route.path.toString(),
                path: route.path.toString()
            };
            route.meta?.right ? this.pages.right.push(page) : this.pages.left.push(page);
        });
    },
    data: () => ({
        pages: { left: [] as { path: string, name: string }[], right: [] as { path: string, name: string }[] }
    })
});
</script>

<style scoped lang="scss">
@media (hover: hover) {
    a.router-link-exact-active, a:hover, a:focus-visible {
        color: var(--primary) !important;
    }
}

a.router-link-exact-active {
    color: var(--primary) !important;
}
</style>
