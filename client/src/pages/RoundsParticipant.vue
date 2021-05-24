<template>
    <Loading v-if="!loaded"/>
    <div v-else class=rounds>
        <div v-if="rounds.length > 0">
            <div v-if="currentRound">
                <span class=round-name>{{currentRound.name}}</span>
                <span class=round-time>{{timeDisplay(currentRound)}}</span>
                <span class=round-description>{{currentRound.description}}</span>
                <Collapse class=challenges label="Challenges" :large="true" :center="true" v-model="currentRound.visible" :loading="currentRound.loading"
                    @toggle="toggledChallenges(currentRound)">
                    <div class="challenge list-item" v-for="challenge in currentRound.challenges" :key="challenge.order">
                        <span class=item-name>{{challenge.name}}</span>
                    </div>
                </Collapse>
            </div>
            <div v-else-if="nextRounds.length > 0">
                <span>TODO: no current round, view next rounds</span>
            </div>
            <div v-else>
                <span>TODO: no current round, competition ended</span>
            </div>

            <Collapse v-if="nextRounds.length > 0" label="Next rounds" :large="true" :value="currentRound == undefined">
                <div class="round list-item" v-for="round in nextRounds" :key="round.start">
                    <span class=item-name>{{round.name}}</span>
                    <span>{{timeDisplay(round)}}</span>
                    <span>{{round.description}}</span>
                    <span>TODO DISPLAY GOOD</span>
                </div>
            </Collapse>

            <Collapse label="Past rounds" v-if="pastRounds.length > 0">
                <div v-for="round in pastRounds" :key="round.start">
                    <span>{{round.name}}</span>
                    <span>TODO DISPLAY</span>
                </div>
            </Collapse>
        </div>
        <div v-else>
            <span>TODO: no rounds yet</span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Loading from '@/components/Loading.vue';
import Collapse from '@/components/Collapse.vue';
import { toggledItems, loadItems } from '@/assets/listFunctions';
import { Round, Challenge, ChallengeType, Hint, Question, validForm, timeDisplay, validChallenges } from '@shared/validation/roundsForm';

type Visible = { visible?: boolean };

export default Vue.extend({
    name: 'RoundsAdmin',
    components: {
        Loading,
        Collapse
    },
    created() {
        axios.get('/api/rounds/data').then(res => {
            this.loaded = true;
            if (validForm(res.data)) this.rounds = res.data.rounds;
            if (this.currentRound) {
                this.currentRound.visible = true;
                this.toggledChallenges(this.currentRound);
                toggledItems(this.currentRound, 'loading', true, undefined, r => this.loadChallenges(r));
            }
        });
    },
    data: () => ({
        rounds: [] as Round[],

        time: new Date(),
        loaded: false
    }),
    computed: {
        pastRounds(): Round[] { return this.rounds.filter(r => new Date(r.end) < this.time); },
        nextRounds(): Round[] { return this.rounds.filter(r => new Date(r.start) > this.time); },
        currentRound(): (Round & Visible) | undefined { return this.rounds[0]; }// TODO: this.rounds.find(r => new Date(r.start) > this.time && new Date(r.end) < this.time); }
    },
    methods: {
        timeDisplay(round: Round) { return timeDisplay(round); },

        toggledChallenges(round: Round & Visible) {
            toggledItems(round, 'loading', round.visible, round.challenges, r => this.loadChallenges(r));
        },
        loadChallenges(round: Round) {
            return loadItems(round, 'challenges', 'loading', 'visible', '/api/rounds/challenges/', (data: any) => validChallenges(data));
        }
    }
});
</script>

<style scoped lang="scss">
@import '@/assets/css/listform.scss';

span {
    display: block;
}

.rounds {
    display: flex;
    justify-content: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    padding-bottom: 0;

    & > * {
        width: min(100%, var(--breakpoint-md));
    }

    .round {
        display: block;

        &:last-child {
            margin-bottom: var(--margin);
        }
    }
}

.round-name, .round-time, .round-description {
    text-align: center;
}

.round-name {
    display: block;
    font-size: var(--font-large);
    font-weight: bold;
}

.round-time {
    padding-bottom: var(--margin);
    margin-bottom: var(--margin);
    border-bottom: 2px solid black;
}

.round-description {
    white-space: pre-wrap;
}

.challenges {
    margin: var(--double-margin) 0;

    .challenge:last-child {
        margin-bottom: var(--double-margin);
    }
}
</style>
