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
        hasTeam: false as boolean //moet hasTeam worden
    }),
    created() {
        axios.get('/api/account/hasTeam').then((response) => {
            if(response.data == true) {
                this.hasTeam = true;
            } else {
                this.hasTeam = false;
            }
        }).catch((err)=>console.log(err));
    },
    computed: {
        createOrDashboard() {
            if(this.hasTeam) {
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
