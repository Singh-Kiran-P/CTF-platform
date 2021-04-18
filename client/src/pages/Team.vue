<template>
    <div class="Team">
        <component :is="createOrDashboard" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Create from '../components/Teams/Create.vue';
import Dashboard from '../components/Teams/Dashboard.vue';

export default Vue.extend({
    name: 'Team',
    components: {
        Create,
        Dashboard
    },
    data: () => ({ 
        loggedIn: false as boolean //moet hasTeam worden
    }),
    created() {
        axios.get('/api/auth/getAuthRole').then((response) => {
            if(response.data.role == "visitor") {
                this.loggedIn = false;
            } else {
                this.loggedIn = true;
            }
        }).catch((err)=>console.log(err));
    },
    computed: {
        createOrDashboard() {
            return Dashboard;
            if(this.loggedIn) {
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
    display: block;
}
</style>
