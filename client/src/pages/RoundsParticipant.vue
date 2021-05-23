<template>
    <Loading v-if="!loaded"/>
    <div v-else class=rounds>
        <div v-if="rounds.length == 0">
            <span>TODO: no rounds yet</span>
        </div>
        <div v-else>
            <div v-if="currentRound">
                <span class=round-name>{{currentRound.name}}</span>
                <span class=round-time>{{timeDisplay(currentRound)}}</span>
                <span class=round-description>{{currentRound.description}}</span>
                <Collapse class=challenges label="Challenges" :large="true" :center="true" v-model="currentRound.visible" :loading="currentRound.loading"
                    @toggle="toggledChallenges(currentRound)">
                    <div class="challenge list-item" v-for="challenge in currentRound.challenges" :key="challenge.order">
                        <span v-if="solved(challenge)"><font-awesome-icon icon=check /> Solved by <b>{{solveNames(challenge)}}</b> for <b>{{solvePoints(challenge)}} points</b></span>
                        <div v-if="!unlocked(challenge, currentRound.challenges)" class=locked>
                            <span><font-awesome-icon icon=lock /> Locked until <b>{{lockedName(challenge, currentRound.challenges)}}</b> is solved</span>
                            <span class=item-name>{{challenge.name}}</span>
                        </div>
                        <div v-else class=unlocked tabindex="0" @click="redirectChallenge(challenge.id)" @keydown.enter="redirectChallenge(challenge.id)">
                            <span v-if="challenge.lock >= 0"><font-awesome-icon icon=lock-open /> Unlocked by solving <b>{{lockedName(challenge, currentRound.challenges)}}</b></span>
                            <span class=item-name>{{challenge.name}}</span>
                            <span class="item-description nowrap">{{challenge.description}}</span>
                            <span class=item-description v-if="challenge.tag">
                                <span class=item-category>Tag</span>
                                <span class=item-value>{{challenge.tag.name}}</span>
                            </span>
                            <span class=item-description>
                                <span class=item-category>Points</span>
                                <span class=item-value>{{challenge.points}}</span>
                            </span>
                            <span class=item-description>
                                <span class=item-category>Type</span>
                                <span class=item-value>{{typeText(challenge.type)}}</span>
                            </span>
                        </div>
                    </div>
                </Collapse>
            </div>
            <div v-else-if="nextRounds.length > 0">
                <span>TODO: no current round, view next rounds</span>
            </div>
            <div v-else>
                <span>TODO: no current round, competition ended</span>
            </div>

            <Collapse v-if="nextRounds.length > 0" label="Next rounds" :large="true" :noborder="true" :value="currentRound == undefined">
                <div class="round list-item" v-for="round in nextRounds" :key="round.start" @click="bruh()">
                    <span class=item-name>{{round.name}}</span>
                    <span>{{timeDisplay(round)}}</span>
                    <span>{{round.description}}</span>
                    <span>TODO DISPLAY GOOD</span>
                </div>
            </Collapse>

            <Collapse class=past-rounds label="Past rounds" v-if="pastRounds.length > 0" :large="true">
                <div class=past-round v-for="round in pastRounds" :key="round.start">
                    <span class=round-name>{{round.name}}</span>
                    <span class=round-time>{{timeDisplay(round)}}</span>
                    <span class=round-description>{{round.description}}</span>
                    <Collapse class=challenges label="Challenges" v-model="round.visible" :loading="round.loading" @toggle="toggledChallenges(round)">
                        <div class="challenge list-item" v-for="challenge in round.challenges" :key="challenge.order" tabindex="0"
                            @click="redirectChallenge(challenge.id)" @keydown.enter="redirectChallenge(challenge.id)">
                            <span class=item-name>{{challenge.name}}</span>
                            <span>TODO DISPLAY GOOD</span>
                        </div>
                    </Collapse>
                </div>
            </Collapse>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Loading from '@/components/Loading.vue';
import Collapse from '@/components/Collapse.vue';
import { toggledItems, loadItems } from '@/assets/listFunctions';
import { Round, Challenge, ChallengeType, Solve, Hint, Question, validForm, timeDisplay, validChallenges } from '@shared/validation/roundsForm';

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

            setInterval(() => this.time = new Date(), 1000); // TODO: show timer
        });
    },
    data: () => ({
        rounds: [] as Round[],

        time: new Date(),
        loaded: false
    }),
    computed: {
        pastRounds(): Round[] { return this.rounds.filter(r => new Date(r.start) > this.time); }, // TODO: r => new Date(r.end) < this.time);
        nextRounds(): Round[] { return this.rounds.filter(r => new Date(r.start) > this.time); },
        currentRound(): (Round & Visible) | undefined { return this.rounds[0]; } // TODO: this.rounds.find(r => new Date(r.start) > this.time && new Date(r.end) < this.time); }
    },
    methods: {
        timeDisplay(round: Round) { return timeDisplay(round); },

        typeText(type: string): string { return type == ChallengeType.INTERACTIVE ? 'Interactive' : (type == ChallengeType.QUIZ ? 'Quiz' : 'Basic'); },
        toggledChallenges(round: Round & Visible): void { toggledItems(round, 'loading', round.visible, round.challenges, r => this.loadChallenges(r)); },
        loadChallenges(round: Round) { return loadItems(round, 'challenges', 'loading', 'visible', '/api/rounds/challenges/', (data: any) => validChallenges(data)); },
        redirectChallenge(id: number | string): void { this.$router.push({ name: 'Challenge', params: { id: id.toString() } }); },

        solved(challenge?: Challenge): boolean { return (challenge?.solves?.length || 0) > 0; },
        solvePoints(challenge: Challenge): number { return challenge.solves?.reduce((acc, cur) => Math.max(acc, cur.points), 0) || 0; },
        solveNames(challenge: Challenge): string { return challenge.solves?.reduce((acc, cur, i) => cur.name + (i == 1 ? ' and ' : (i == 0 ? '' : ', ')) + acc, '') || ''; },
        lockedChallenge(challenge: Challenge, challenges: Challenge[]): Challenge | undefined { return challenges.find(c => c.order == challenge.lock); },
        unlocked(challenge: Challenge, challenges: Challenge[]): boolean { return challenge.lock < 0 || this.solved(this.lockedChallenge(challenge, challenges)); },
        lockedName(challenge: Challenge, challenges: Challenge[]): string { return this.lockedChallenge(challenge, challenges)?.name || ''; }
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
    margin-bottom: var(--margin);
    padding-bottom: var(--margin);
    border-bottom: 2px solid black;
}

.round-description {
    white-space: pre-wrap;
}

.challenges {
    margin: var(--margin) 0;

    .challenge {
        display: block;

        .unlocked:hover, .unlocked:focus-visible {
            outline: none;

            .item-name {
                color: var(--primary);
                text-decoration: underline;
            }
        }

        .locked .item-name {
            color: var(--gray);
        }
    }

    .challenge:last-child {
        margin-bottom: var(--double-margin);
    }
}

.past-rounds {
    margin-top: var(--margin);
    padding-top: var(--margin);
    border-top: 2px solid black;
}

.past-round {
    padding: var(--double-margin) 0;

    .round-name, .round-time, .round-description {
        text-align: initial;
    }

    .round-time {
        border: initial;
        margin: initial;
        padding: initial;
    }

    .challenges {
        margin: initial;

        .challenge:last-child {
            margin-bottom: var(--margin);
        }
    }
}
</style>
