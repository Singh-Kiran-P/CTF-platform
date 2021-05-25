<template>
    <Loading v-if="!loaded"/>
    <div v-else-if="!challenge">
        <span>TODO: error</span>    
    </div>
    <div v-else>
        <span>{{JSON.stringify(challenge)}}</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Loading from '@/components/Loading.vue';
import Collapse from '@/components/Collapse.vue';
import { Challenge, ChallengeType, Hint, Question, durationDisplay, validChallenge } from '@shared/validation/roundsForm';

export default Vue.extend({
    name: 'RoundsAdmin',
    components: {
        Loading,
        Collapse
    },
    created() {
        axios.get('/api/challenges/' + this.$route.params.id).then(res => {
            this.loaded = true;
            if (validChallenge(res.data)) this.challenge = res.data;

            setTimeout(() => { // TODO: show timer
                if (this.challenge?.round && new Date() > new Date(this.challenge.round.end))
                    location.reload();
            }, 1000);
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
span {
    display: block;
}
</style>
