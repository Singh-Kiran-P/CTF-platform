<template>
    <div class=page-not-found>
        <span class=error>404 page not found</span>
        <span v-if="auth">Return to the <router-link to="/">Home page</router-link></span>
        <span v-else>You might have to <router-link :to="{ name: 'Login' }">Log in</router-link> or <router-link :to="{ name: 'Register' }">Register</router-link> first</span>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    name: 'PageNotFound',
    computed: {
        auth(): boolean { return this.$route.meta.auth; }
    }
});
</script>

<style scoped lang="scss">
.page-not-found {
    padding: var(--double-margin);
}

.error {
    margin-bottom: var(--double-margin);
    font-size: var(--font-massive);
    font-weight: bold;
}

span, :not(span) > a {
    display: block;
    text-align: center;
}
</style>
