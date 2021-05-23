<template>
    <Loading v-if="!loaded"/>
    <div v-else>
        
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Loading from '@/components/Loading.vue';
import Collapse from '@/components/Collapse.vue';
import { Challenge, ChallengeType, Hint, Question, timeDisplay, validChallenge } from '@shared/validation/roundsForm';

export default Vue.extend({
    name: 'RoundsAdmin',
    components: {
        Loading,
        Collapse
    },
    created() {
        axios.get('/api/rounds/challenge/' + this.$route.params.id).then(res => {
            this.loaded = true;
            if (validChallenge(res.data)) this.challenge = res.data;

        });
    },
    data: () => ({
        challenge: undefined as Challenge | undefined,
        
        loaded: false
    }),
    computed: {
        
    },
    methods: {

    }
});
</script>

<style scoped lang="scss">

</style>
