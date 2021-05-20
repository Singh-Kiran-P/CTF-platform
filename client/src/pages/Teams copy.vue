<template>
    <div class="teams">
        <Loading v-if="isLoading"/>
        <Teams v-else />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Teams from '../components/Teams/Create.vue';
import Loading from '../components/Loading.vue'

export default Vue.extend({
    name: 'Teams',
    components: {
        Loading,
        Teams
    },
    data: () => ({ 
        isLoading: true
    }),
    created() {
    },
    computed: {
    }
});
</script>

<style scoped lang="scss">

</style>
