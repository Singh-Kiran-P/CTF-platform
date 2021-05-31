<template>
    <div class=joinTeam>
        <span v-if="error">Invalid invite link, return to the <router-link :to="{ name: 'Team' }">Team page</router-link></span>
        <Loading v-else/>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Loading from '../components/Loading.vue'

export default Vue.extend({
    name: 'JoinTeam',
    components: {
        Loading
    },
    data: () => ({
        error: false
    }),
    created() {
        axios.post('/api/team/join/'+this.$route.params.invite).then((response) => {
            if (response.data.error) this.error = true;
            else this.$router.replace('/team');
        }).catch(() => this.error = true);
    }
});
</script>

<style scoped lang="scss">
.joinTeam {
    text-align: center;
    padding: var(--double-margin);
}
</style>
