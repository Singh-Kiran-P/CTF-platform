<template>
    <div class="joinTeam">
        <Loading v-if="isLoading"/>
        <span v-else class=error>{{this.error}}</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Loading from '../components/Loading.vue'

export default Vue.extend({
    name: 'joinTeam',
    components: {
        Loading
    },
    data: () => ({ 
        isLoading: true,
        error: ''
    }),
    created() {
        axios.post('/api/team/join/'+this.$route.params.invite).then((response) => {
            if(response.data.error) {this.error = response.data.error; this.isLoading = false; return;}
            this.$router.replace('/team');
        }).catch((err)=>console.log(err))
    },
    computed: {
    }
});
</script>

<style scoped lang="scss">
.joinTeam {
    text-align: center;
}
.joinTeam {
    padding: var(--triple-margin);
}
.error {
    margin-top: var(--triple-margin);
}
</style>
