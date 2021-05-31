<template>
    <Loading v-if="!loaded"/>
    <div v-else class=rounds>
        <div v-if="joinTeam">
            <span class=center>You have to be part of a team to join the competition</span>
            <router-link class=center :to="{ name: 'Team' }">Create or join a team</router-link>
        </div>
        <div v-else-if="rounds.length == 0">
            <span class=center>The competition does not yet have any rounds</span>
        </div>
        <div v-else>
            <AdminHeader v-if="admin || true /*TODO REMOVE '|| TRUE'*/" v-model="offset" :names="this.rounds.map(r => r.name)" :times="this.rounds.map(r => r.start)"/>
            <div v-if="currentRound">
                <span class="round-name center">{{currentRound.name}}</span>
                <span class="round-duration center">{{durationDisplay(currentRound)}}</span>
                <span class="round-time center">{{countdownDisplay(currentRound)}}</span>
                <span class="round-description center"><span v-if="currentRound.description">{{currentRound.description}}</span></span>
                <Collapse label="Challenges" large center noborder v-model="currentRound.visible" :loading="currentRound.loading"
                    @toggle="toggledChallenges(currentRound)">
                    <div class=challenges>
                        <div class=tag-challenges v-for="tag in roundTags(currentRound)" :key="tagName(tag)">
                            <Collapse :label="tagName(tag)" center noborder :infoContent="tagDescription(tag)">
                                <div v-for="challenge in tagChallenges(currentRound, tag)" :key="challenge.order" :tabindex="unlocked(challenge, currentRound.challenges) ? 0 : -1"
                                    :class="['challenge', 'list-item', unlocked(challenge, currentRound.challenges) ? 'unlocked' : 'locked', { 'solved': solved(challenge) }]"
                                    @click="redirectChallenge(challenge.id, $event)" @keydown.enter="redirectChallenge(challenge.id, $event)">
                                    <span v-if="solved(challenge)">
                                        <font-awesome-icon icon=check class=icon-primary /> Solved by <b>{{solveNames(challenge)}}</b> for <b>{{solvePoints(challenge)}}</b>
                                    </span>
                                    <template v-if="!unlocked(challenge, currentRound.challenges)">
                                        <span><font-awesome-icon icon=lock class=icon-info /> Locked until <b>{{lockedName(challenge, currentRound.challenges)}}</b> is solved</span>
                                        <span class=item-name>{{challenge.name}}</span>
                                    </template>
                                    <template v-else>
                                        <span v-if="challenge.lock >= 0">
                                            <font-awesome-icon icon=lock-open class=icon-info /> Unlocked by solving <b>{{lockedName(challenge, currentRound.challenges)}}</b>
                                        </span>
                                        <span class=item-name>{{challenge.name}}</span>
                                        <span class="item-description nowrap">{{challenge.description}}</span>
                                        <span class=item-description>
                                            <span class=item-category>Type</span>
                                            <span class=item-value>{{typeName(challenge)}}</span>
                                            <Tooltip class=item-value-tooltip :title="typeName(challenge)" :content="typeDescription(challenge)">
                                                <font-awesome-icon icon=info-circle class=icon-info />
                                            </Tooltip>
                                        </span>
                                        <span class=item-description>
                                            <span class=item-category>Points</span>
                                            <span class=item-value>{{challenge.points}}</span>
                                        </span>
                                    </template>
                                </div>
                            </Collapse>
                        </div>
                    </div>
                </Collapse>
            </div>
            <div v-else-if="nextRounds.length > 0">
                <span class=center>There is currently no round ongoing</span>
                <span class=center>The next round starts in <b>{{countdownDisplay(nextRounds[0])}}</b></span>
            </div>
            <div v-else>
                <span class=center>All rounds have ended, you can view them below</span>
            </div>

            <Collapse v-if="nextRounds.length > 0" class=next-rounds label="Next rounds" large noborder :value="!currentRound">
                <div class="round list-item" v-for="round in nextRounds" :key="round.start">
                    <span class=item-name>{{round.name}}</span>
                    <span>{{durationDisplay(round)}}</span>
                </div>
                <div class=bottom-padding />
            </Collapse>

            <Collapse v-if="pastRounds.length > 0" class=past-rounds label="Past rounds" large noborder :value="!currentRound && nextRounds.length == 0">
                <div class=past-round v-for="round in pastRounds" :key="round.start">
                    <span class=round-name>{{round.name}}</span>
                    <div class=past-round-content>
                        <span class=round-duration>{{durationDisplay(round)}}</span>
                        <span class=round-description>{{round.description}}</span>
                        <Collapse label="Challenges" v-model="round.visible" :loading="round.loading" noborder @toggle="toggledChallenges(round)">
                            <div class=challenges>
                                <div class=tag-challenges v-for="tag in roundTags(round)" :key="tagName(tag)">
                                    <Collapse :label="tagName(tag)" center noborder :infoContent="tagDescription(tag)">
                                        <div v-for="challenge in tagChallenges(round, tag)" :key="challenge.order" :tabindex="0"
                                            :class="['challenge', 'list-item', 'unlocked', solved(challenge) ? 'solved' : 'unsolved']"
                                            @click="redirectChallenge(challenge.id, $event)" @keydown.enter="redirectChallenge(challenge.id, $event)">
                                            <span v-if="!solved(challenge)"><font-awesome-icon icon=times class=icon-danger /> Not solved</span>
                                            <span v-else>
                                                <font-awesome-icon icon=check class=icon-primary /> Solved by <b>{{solveNames(challenge)}}</b> for <b>{{solvePoints(challenge)}}</b>
                                            </span>
                                            <span v-if="!unlocked(challenge, round.challenges)">
                                                <font-awesome-icon icon=lock class=icon-info /> Locked because <b>{{lockedName(challenge, round.challenges)}}</b> was not solved
                                            </span>
                                            <span v-else-if="challenge.lock >= 0">
                                                <font-awesome-icon icon=lock-open class=icon-info /> Unlocked by solving <b>{{lockedName(challenge, round.challenges)}}</b>
                                            </span>
                                            <span class=item-name>{{challenge.name}}</span>
                                            <span class="item-description nowrap">{{challenge.description}}</span>
                                            <span class=item-description>
                                                <span class=item-category>Type</span>
                                                <span class=item-value>{{typeName(challenge)}}</span>
                                                <Tooltip class=item-value-tooltip :title="typeName(challenge)" :content="typeDescription(challenge)">
                                                    <font-awesome-icon icon=info-circle class=icon-info />
                                                </Tooltip>
                                            </span>
                                            <span class=item-description>
                                                <span class=item-category>Points</span>
                                                <span class=item-value>{{challenge.points}}</span>
                                            </span>
                                        </div>
                                    </Collapse>
                                </div>
                            </div>
                        </Collapse>
                    </div>
                </div>
            </Collapse>
            <div class=bottom-padding />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Loading from '@/components/Loading.vue';
import Tooltip from '@/components/Tooltip.vue';
import Collapse from '@/components/Collapse.vue';
import { Tag } from '@/shared/src/validation/configForm';
import AdminHeader from '@/components/AdminHeader.vue';
import { toggledItems, loadItems } from '@/assets/functions/list';
import { Round, Challenge, validForm, validChallenges } from '@/shared/src/validation/roundsForm';
import { typeName, typeDescription, solvePoints, solveNames, durationDisplay, countdownDisplay } from '@/assets/functions/strings';

type Visible = { visible?: boolean };

export default Vue.extend({
    name: 'Rounds',
    components: {
        Loading,
        Tooltip,
        Collapse,
        AdminHeader
    },
    created() {
        axios.get('/api/rounds/data').then(res => {
            if (res.data.joinTeam) this.joinTeam = true;
            else if (validForm(res.data)) this.rounds = res.data.rounds;
            if (this.currentRound) {
                this.currentRound.visible = true;
                this.toggledChallenges(this.currentRound);
                toggledItems(this.currentRound, 'loading', true, undefined, r => this.loadChallenges(r));
            }

            setInterval(() => this.realTime = new Date(), 100);
            this.loaded = true;
        }).catch(() => this.loaded = true);
    },
    data: () => ({
        rounds: [] as Round[],

        offset: 0,
        realTime: new Date(),
        joinTeam: false,
        loaded: false
    }),
    watch: {
        offset() {
            if (!this.currentRound) return;
            this.currentRound.challenges = undefined;
            this.rounds.forEach((r: Round & Visible) => r.visible = r == this.currentRound);
            this.toggledChallenges(this.currentRound);
        }
    },
    computed: {
        admin(): boolean { return this.$route.meta?.admin; },
        time(): Date { return new Date(this.realTime.getTime() + this.offset); },
        pastRounds(): Round[] { return this.rounds.filter(r => new Date(r.end) < this.time).reverse(); },
        nextRounds(): Round[] { return this.rounds.filter(r => new Date(r.start) > this.time); },
        currentRound(): (Round & Visible) | undefined { return this.rounds.find(r => new Date(r.start) < this.time && new Date(r.end) > this.time); }
    },
    methods: {
        tagName(tag: Tag | null): string { return tag?.name || 'No tag' },
        tagDescription(tag: Tag | null): string { return tag?.description || 'No tag set' },
        roundTags(round?: Round): (Tag | null)[] { return (round?.challenges || []).map(c => c.tag).filter((a, i, l) => l.findIndex(b => this.tagName(a) == this.tagName(b)) == i); },
        tagChallenges(round?: Round, tag?: Tag | null): Challenge[] { return (round?.challenges || []).filter(c => !c.tag ? c.tag == tag : c.tag.name == tag?.name); },

        durationDisplay(round: Round) { return durationDisplay(round); },
        countdownDisplay(round: Round): string { return countdownDisplay(this.time, round); },

        typeName(challenge: Challenge): string { return typeName(challenge.type); },
        typeDescription(challenge: Challenge): string { return typeDescription(challenge.type); },
        toggledChallenges(round: Round & Visible): void { toggledItems(round, 'loading', round.visible, round.challenges, r => this.loadChallenges(r)); },
        loadChallenges(round: Round) { return loadItems(round, 'challenges', 'loading', 'visible', '/api/challenges/round/', (data: any) => validChallenges(data)); },
        redirectChallenge(id: number | string, e?: MouseEvent | KeyboardEvent): void {
            let route = { name: 'Challenge', params: { id: id.toString() } };
            e?.ctrlKey ? window.open(this.$router.resolve(route).href, '_blank') : this.$router.push(route);
        },

        solved(challenge?: Challenge): boolean { return (challenge?.solves?.length || 0) > 0; },
        solvePoints(challenge: Challenge): string { return solvePoints(challenge.solves || []); },
        solveNames(challenge: Challenge): string { return solveNames(challenge.solves || []); },
        lockedChallenge(challenge: Challenge, challenges: Challenge[]): Challenge | undefined { return challenges.find(c => c.order == challenge.lock); },
        unlocked(challenge: Challenge, challenges: Challenge[]): boolean { return this.admin || challenge.lock < 0 || this.solved(this.lockedChallenge(challenge, challenges)); },
        lockedName(challenge: Challenge, challenges: Challenge[]): string { return this.lockedChallenge(challenge, challenges)?.name || ''; }
    }
});
</script>

<style scoped lang="scss">
@import '@/assets/css/listform.scss';

span, a {
    display: block;
}

.rounds {
    display: flex;
    justify-content: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    padding-bottom: 0;

    & > * {
        width: min(100%, var(--breakpoint-lg));
    }

    .round {
        display: block;
    }
}

.round-name {
    font-weight: bold;
    font-size: var(--font-massive);
}

.round-time {
    margin-bottom: var(--margin);
    padding-bottom: var(--margin);
    border-bottom: var(--border-c) solid var(--black-c);
}

.round-description {
    white-space: pre-wrap;

    span {
        text-align: initial;
        display: inline-block;
    }
}

$min-column-width: calc(var(--breakpoint-sm) / 2);

.challenges {
    margin: var(--margin) 0;
    -webkit-columns: $min-column-width 2;
    -moz-columns: $min-column-width 2;
    columns: $min-column-width 2;
    -webkit-column-gap: var(--margin);
    -moz-column-gap: var(--double-margin);
    column-gap: var(--double-margin);
    -moz-column-fill: balance;
    column-fill: balance;


    & > * {
        padding-bottom: var(--double-margin);
        -webkit-column-break-inside: avoid;
        break-inside: avoid-column;
        page-break-inside: avoid;
    }

    .challenge {
        display: block;
        transition: 0.1s;
        border-left: var(--margin) solid var(--info);

        &.solved {
            border-color: var(--primary);
        }

        &.unsolved {
            border-color: var(--danger);
        }

        &.unlocked:hover, &.unlocked:focus-visible {
            outline: none;
            cursor: pointer;
            border-left-width: var(--double-margin);

            .item-name {
                color: var(--primary);
                text-decoration: underline;
            }
        }

        &.locked  {
            pointer-events: none;

            .item-name {
                color: var(--gray-c);
            }
        }
    }
}

.next-rounds, .past-rounds {
    margin-top: var(--margin);
    padding-top: var(--margin);
    border-top: var(--border-c) solid var(--black-c);
}

.past-rounds {
    .past-round {
        padding-top: var(--margin);

        .past-round-content {
            padding: var(--margin);
            border: var(--border-c) solid var(--black-c);
            border-radius: var(--border-radius);
        }

        .round-name {
            padding-left: var(--margin);
            font-size: initial;
        }

        .challenges {
            margin: initial;

            .challenge:last-child {
                margin-bottom: 0;
            }
        }
    }
}

.icon-primary {
    color: var(--primary);
}

.icon-danger {
    color: var(--danger);
}

.icon-info {
    color: var(--info);
}
</style>
