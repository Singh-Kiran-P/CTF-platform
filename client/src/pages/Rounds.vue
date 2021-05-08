<template>
    <div class=list-form>
        <b-form @submit="onSubmit($event)">
            <b-form-group :state="state(roundsFeedback)" :invalid-feedback="roundsFeedback">
            <div class="list-item nostyle round" v-for="(round, i) in form.rounds" :key="i /* TODO */">
                    <div class=item-content>
                        <template v-if="!round.editable">
                            <span class=item-name>{{round.name}}</span>
                            <span>{{timeDisplay(round)}}</span>
                        </template>
                        <template v-else>
                            <b-form-input type=text trim v-model="round.name" placeholder="Enter round name" :state="state(roundFeedback(round))"/>
                            <DateTimePicker v-model="round.start" :state="state(roundFeedback(round))" label="Starts at"/>
                            <DateTimePicker v-model="round.end" :state="state(roundFeedback(round))"  label="Ends at"/>
                            <b-form-invalid-feedback>{{roundFeedback(round)}}</b-form-invalid-feedback>
                        </template>
                    </div>
                    <IconButton class=info icon=pen icon2=save :toggled="round.editable" :disabled="round.editable && !state(roundFeedback(round))" @click="editRound(round)"/>
                    <IconButton class=danger icon=times @click="removeRound(round)"/>

                    <b-form-group class=challenges :state="state(challengesFeedback(round))" :invalid-feedback="challengesFeedback(round)">
                        <Collapse label=Challenges noborder v-model="round.visible" :loading="round.loading" @toggle="toggledRound(round)">
                            <div class=list-item v-for="challenge in round.challenges" :key="challenge.order">
                                <div :class="['item-content', { editable: challenge.editable }]">
                                    <template v-if="!challenge.editable">
                                        <span class=item-name>{{challenge.name}}</span>
                                        <span class=item-description>{{challenge.description}}</span>
                                    </template>
                                    <template v-else>
                                        <b-form-input type=text trim v-model="challenge.name" placeholder="Enter challenge name"
                                            :state="state(challengeFeedback(round, challenge))"
                                        />
                                        <b-form-textarea max-rows="10" v-model="challenge.description" placeholder="Enter challenge description"
                                            :state="state(challengeFeedback(round, challenge))"
                                        />
                                    </template>
                                    <span class=item-description>
                                        <span class=item-category>Points</span>
                                        <span v-if="!challenge.editable" class=item-value>{{challenge.points}}</span>
                                        <b-form-input v-else type=number :number="true" v-model="challenge.points" placeholder="Enter challenge points"
                                            :state="state(challengeFeedback(round, challenge))"
                                        />
                                    </span>
                                    <span class=item-description>
                                        <span class=item-category>Flag</span>
                                        <span v-if="!challenge.editable" class=item-value>{{challenge.flag}}</span>
                                        <b-form-input v-else type=text trim v-model="challenge.flag" placeholder="Enter challenge flag"
                                            :state="state(challengeFeedback(round, challenge))"
                                        />
                                    </span>
                                    <span class=item-description>
                                        <span class=item-category>Attachments</span>
                                        <span v-if="!challenge.editable" class=item-value>{{attachments(challenge)}}</span>
                                        <b-form-file v-else accept=".zip" v-model="challenge.zip" :placeholder="zipPlaceholder(challenge)"
                                            :state="state(challengeFeedback(round, challenge))"
                                        />
                                    </span>
                                    <b-form-invalid-feedback>{{challengeFeedback(round, challenge)}}</b-form-invalid-feedback>
                                </div>
                                <IconButton class=info icon=pen icon2=save :toggled="challenge.editable" @click="editChallenge(round, challenge)"
                                    :disabled="challenge.editable && !state(challengeFeedback(round, challenge))"
                                />
                                <IconButton class=primary icon=chevron-down @click="challengeDown(round, challenge)"/>
                                <IconButton class=danger icon=times @click="removeChallenge(round, challenge)"/>
                            </div>
                            <b-button class=add-list-item variant=primary block @click="addChallenge(round)">Add a new challenge</b-button>
                        </Collapse>
                    </b-form-group>
                </div>
                <Collapse label="Add a new round">
                    <div class=add-list-item>
                        <b-form-input type=text trim v-model="add.round.name" placeholder="Enter new round name" :state="state(newRoundFeedback)"/>
                        <b-button type=button variant=primary :disabled="!validNewRound" @click="addRound()"><font-awesome-icon icon=plus /></b-button>
                        <DateTimePicker v-model="add.round.start" :state="state(newRoundFeedback)" label="Starts at"/>
                        <DateTimePicker v-model="add.round.end" :state="state(newRoundFeedback)" label="Ends at"/>
                        <b-form-invalid-feedback>{{newRoundFeedback}}</b-form-invalid-feedback>
                    </div>
                </Collapse>
            </b-form-group>

            <StatusButton type=button variant=danger :state="cancelState" normal=Cancel loading=Loading succes=Loaded :disabled="saveState == 'loading'" @click="onCancel()"/>
            <StatusButton type=submit variant=primary :state="saveState" normal=Save loading=Saving succes=Saved :disabled="!validForm || cancelState == 'loading'"/>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import Collapse from '@/components/Collapse.vue';
import IconButton from '@/components/IconButton.vue';
import StatusButton from '@/components/StatusButton.vue';
import DateTimePicker from '@/components/DateTimePicker.vue';
import { nextOrder, moveDown } from '@/assets/listFunctions';
import { state, validInput, sortRounds, validForm, validChallenges, validate, Challenge, Round, Form } from '@shared/validation/roundsForm';
import { serialize } from '@shared/objectFormdata';
import path from 'path';

type Editable = { editable?: boolean };
type Visible = { visible?: boolean };
type Loading = { loading?: boolean };

export default Vue.extend({
    name: 'Rounds',
    components: {
        Collapse,
        IconButton,
        StatusButton,
        DateTimePicker
    },
    created() {
        this.loadFormData();
    },
    data: () => ({
        form: {
            rounds: [] as (Round & Visible)[]
        },
        add: {
            round: { name: '', start: '', end: '' }
        },

        loaded: false,
        saveState: 'normal',
        cancelState: 'normal'
    }),
    computed: {
        newRound(): Round { return Object.assign({}, this.add.round, { folder: '', challenges: [] }); },

        newRoundFeedback(): string { return this.roundFeedback(this.newRound, true); },
        validNewRound(): boolean { return validInput(this.newRoundFeedback, this.newRound.name, this.newRound.start, this.newRound.end); },

        roundsFeedback(): string { return validate.rounds(this.form.rounds); },

        validForm(): boolean { return validForm(this.form); }
    },
    watch: {
        form: { deep: true, handler() { // TODO: ignore editable and visible and loading?
            let state = 'normal';
            if (this.loaded) {
                state = 'succes';
                this.loaded = false;
            }
            this.saveState = state;
            this.cancelState = state;
        }}
    },
    methods: {
        state, // make the state function available in the html

        loadFormData(close: boolean = true): void {
            this.cancelState = 'loading';
            if (close) this.add.round = { name: '', start: '', end: '' };
            const error = () => {
                this.cancelState = 'error';
                this.saveState = 'normal';
            }
            axios.get('/api/rounds/data').then(res => {
                let data: Form = res.data;
                if (!validForm(data)) return error();
                let rounds = data.rounds.map((round, i) => Object.assign({}, round, { visible: close ? false : this.form.rounds[i]?.visible }));
                Promise.all(rounds.filter(round => round.visible).map(round => this.loadChallenges(round))).then(() => {
                    this.loaded = true;
                    this.form.rounds = rounds;
                });
            }).catch(() => error());
        },
        onCancel(): void {
            this.loadFormData();
        },
        onSubmit(e: Event): void {
            e.preventDefault();
            this.saveState = 'loading';
            const error = () => this.saveState = 'error';
            axios.put('/api/rounds/save', serialize(this.form)).then(res => {
                res.data.error ? error() : this.loadFormData(false);
            }).catch(() => error());
        },

        timeDisplay(round: Round): string {
            let [start, end] = [round.start, round.end].map(time => new Date(time));
            let [startday, endday] = [start, end].map(time => time.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
            let [starttime, endtime] = [start, end].map(time => time.toLocaleString('nl-BE', { hour: 'numeric', minute: 'numeric' }));
            return `${startday}, ${starttime} - ${startday == endday ? '' : endday + ', '}${endtime}`;
        },
        roundFeedback(round: Round, add: boolean = false): string { return validate.round(round, this.form.rounds, add); },
        removeRound(round: Round): void { this.form.rounds = this.form.rounds.filter(x => x != round); },
        editRound(round: Round & Editable): void {
            if (round.editable && !state(this.roundFeedback(round))) return;
            if (round.editable) this.form.rounds = sortRounds(this.form.rounds);
            Vue.set(round, 'editable', !round.editable);
        },
        addRound(): void {
            if (!this.validNewRound) return;
            this.form.rounds = sortRounds(this.form.rounds.concat(this.newRound));
            this.add.round = { name: '', start: '', end: '' };
        },
        toggledRound(round: Round & Visible & Loading): void {
            if (round.visible && round.challenges == undefined) {
                Vue.set(round, 'loading', true);
                this.loadChallenges(round);
            }
        },
        loadChallenges(round: Round & Visible & Loading): Promise<void> {
            return new Promise<void>(resolve => {
                const setChallenges = (challenges?: Challenge[]) => {
                    Vue.set(round, 'challenges', challenges);
                    Vue.set(round, 'loading', false);
                    resolve();
                }
                if (!round.id) setChallenges([]);
                else axios.get('/api/rounds/challenges/' + round.id).then(res => {
                    if (res.data.error || !validChallenges(res.data)) {
                        Vue.set(round, 'visible', false);
                        setChallenges(undefined);
                    } else setChallenges(res.data);
                });
            });
        },

        attachments(challenge: Challenge): string { return challenge.zip ? challenge.zip.name || '' : path.basename(challenge.attachments); },
        zipPlaceholder(challenge?: Challenge): string { return challenge && (challenge.zip || challenge.attachments) ? this.attachments(challenge) : 'Upload challenge attachments'; },
        challengesFeedback(round: Round): string { return validate.challenges(round.challenges); },
        challengeDown(round: Round, challenge: Challenge): void { moveDown(round.challenges || [], x => x.name == challenge.name); },
        challengeFeedback(round: Round, challenge: Challenge, add: boolean = false): string { return validate.challenge(challenge, round.challenges, add); },
        removeChallenge(round: Round, challenge: Challenge): void { round.challenges = round.challenges?.filter(x => x.order != challenge.order) || []; },
        addChallenge(round: Round): void {
            if (round.challenges == undefined) round.challenges = [];
            let add = { name: '', description: '', points: 0, flag: '', order: nextOrder(round.challenges), attachments: '', zip: null, editable: true };
            round.challenges.push(add);
        },
        editChallenge(round: Round, challenge: Challenge & Editable): void {
            if (!challenge.editable || state(this.challengeFeedback(round, challenge))) Vue.set(challenge, 'editable', !challenge.editable);
        }
    }
});
</script>

<style scoped lang="scss">
@import '@/assets/css/listform.scss';

.round {
    flex-wrap: wrap;
    border-bottom: 2px solid black;
    
    & > button {
        background-color: var(--white);
    }

    &:not(:last-of-type) {
        margin-bottom: var(--double-margin);
    }
    
    .item-name {
        font-size: var(--font-large);
    }

    .date-time-picker {
        margin-top: var(--margin);
    }
}

.challenges {
    width: 100%;
    margin: var(--margin) 0;

    .list-item {
        .item-description {
            white-space: pre-wrap;
        }
    }

    .add-list-item {
        display: block;
        margin-bottom: 0;
    }
}
</style>
