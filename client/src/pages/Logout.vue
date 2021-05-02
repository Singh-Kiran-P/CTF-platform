<template>
    <Loading/>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Loading from '../components/Loading.vue';

export default Vue.extend({
    name: 'Logout',
    components: {
        Loading
    },
    created() {
        axios.get("/api/auth/logout").then(() => {
            location.reload();
            location.replace('/login');
        });
    }
});
</script>
