<template>
    <div class="Teams">
        <component v-if="noError" :is="createOrDashboard" />
        <span v-else class=error>Error</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Create from '../components/Teams/Create.vue';
import Dashboard from '../components/Teams/Dashboard.vue';
import Loading from '../components/Loading.vue'

export default Vue.extend({
    name: 'Teams',
    components: {
        Dashboard,
        Loading
    },
    data: () => ({ 
        isLoading: true,
        noError: false,
        hasTeam: false,
    }),
    created() {
        axios.get('/api/account/hasTeam').then((response) => {
            if(response.data == true) {
                this.hasTeam = true;
            } else {
                this.hasTeam = false;
            }
            this.isLoading = false;
        }).catch((err)=>console.log(err));
    },
    computed: {
        createOrDashboard() {
            if(this.isLoading){
                return Loading;
            } else if(this.hasTeam) {
                return Dashboard;
            } else {
                return Create;
            }
        }
    }
});
</script>

<style scoped lang="scss">
span {
    font-weight: bold;
}
</style>
