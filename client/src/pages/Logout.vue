<template>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios"

export default Vue.extend({
    name: "Logout",
    created() {
        this.logout();
    },
    methods: {
        logout() {
            axios
            .get("/api/auth/logout")
            .then(() => {
                this.$router.push({name: 'Login'}); //or reload, needs to be configured using Landers code
            });
        }
    }
});
</script>

<style scoped lang="scss">
</style>
