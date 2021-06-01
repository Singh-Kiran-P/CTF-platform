<template>
    <component :is="show" />
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import CreateTeam from '@/components/CreateTeam.vue';
import PageNotFound from '@/pages/PageNotFound.vue';
import Dashboard from '@/pages/TeamDashboard.vue';
import Loading from '@/components/Loading.vue';

export default Vue.extend({
    name: 'Team',
    components: {
        PageNotFound,
        CreateTeam,
        Dashboard,
        Loading
    },
    data: () => ({
        isLoading: true,
        hasTeam: false,
        error: false
    }),
    created() {
        axios.get('/api/account/hasTeam').then((response) => {
            this.isLoading = false;
            if (response.data == true) this.hasTeam = true;
            else this.hasTeam = false;
        }).catch(() => this.error = true);
    },
    computed: {
        show() { return this.error ? PageNotFound : (this.isLoading ? Loading : (this.hasTeam ? Dashboard : CreateTeam)); }
    }
});
</script>
