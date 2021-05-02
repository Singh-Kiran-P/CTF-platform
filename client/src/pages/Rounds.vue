<template>
    <div class=rounds>
        <b-form @submit="onSubmit($event)">
            <b-form-group :state="state(roundsFeedback)" :invalid-feedback="roundsFeedback">
                <div class=round v-for="(round, i) in form.rounds" :key="i /* TODO */">
                    <div class=round-content>
                        <template v-if="!round.editable">
                            <span class=round-name>{{round.name}}</span>
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

                    <b-form-group :state="state(challengesFeedback(round))" :invalid-feedback="challengesFeedback(round)">
                        <Collapse label=Challenges noborder>
                            <div class=challenge v-for="(challenge, i) in round.challenges" :key="i /* TODO */">

                            </div>
                        </Collapse>
                    </b-form-group>
                </div>
                <Collapse label="Add a new round">
                    <div class=add-round>
                        <b-form-input type=text trim v-model="add.round.name" placeholder="Enter new round name" :state="state(newRoundFeedback)"/>
                        <b-button type=button variant=primary :disabled="!validNewRound" @click="addRound()"><font-awesome-icon icon=plus /></b-button>
                        <DateTimePicker v-model="add.round.start" :state="state(newRoundFeedback)" label="Starts at"/>
                        <DateTimePicker v-model="add.round.end" :state="state(newRoundFeedback)"  label="Ends at"/>
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
import { state, validInput, sortRounds, validForm, validate, Challenge, Round, Form } from '@shared/validation/roundsForm';
import { serialize } from '@shared/objectFormdata';

type Edit = { editable?: boolean };

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
            rounds: [] as (Round & Edit)[]
        },
        add: {
            round: { name: '', start: '', end: '' }
        },

        loaded: false,
        saveState: 'normal',
        cancelState: 'normal',

        testDate: ''
    }),
    computed: {
        newRound(): Round { return Object.assign({}, this.add.round, { challenges: [] }); },

        newRoundFeedback(): string { return this.roundFeedback(this.newRound, true); },
        validNewRound(): boolean { return validInput(this.newRoundFeedback, this.newRound.name, this.newRound.start, this.newRound.end); },

        roundsFeedback(): string { return validate.rounds(this.formData.rounds); },

        formData(): Form { return {
            rounds: this.form.rounds // TODO
        } },
        validForm(): boolean { return validForm(this.formData, false); }
    },
    watch: {
        formData: { deep: true, handler() {
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

        loadFormData(): void {
            this.cancelState = 'loading';
            // TODO
            const error = () => {
                this.cancelState = 'error';
                this.saveState = 'normal';
            }
            axios.get('/api/rounds/data').then(res => {
                let data: Form = res.data;
                if (!validForm(data)) return error();
                this.loaded = true;
                this.form = data;
            }).catch(() => error());
        },
        onCancel(): void {
            this.loadFormData();
        },
        onSubmit(e: Event): void {
            e.preventDefault();
            this.saveState = 'loading';
            const error = () => this.saveState = 'error';
            axios.put('/api/rounds/save', serialize(this.formData)).then(res => {
                res.data.error ? error() : this.loadFormData();
            }).catch(() => error());
        },

        timeDisplay(round: Round): string {
            let [start, end] = [round.start, round.end].map(time => new Date(time));
            let [startday, endday] = [start, end].map(time => time.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
            let [starttime, endtime] = [start, end].map(time => time.toLocaleString('nl-BE', { hour: 'numeric', minute: 'numeric' }));
            return `${startday}, ${starttime} - ${startday == endday ? '' : endday + ', '}${endtime}`;
        },
        roundFeedback(round: Round, add: boolean = false): string { return validate.round(round, this.form.rounds, add); },
        removeRound(round: Round): void { this.form.rounds = this.form.rounds.filter(x => x.start != round.start); },
        editRound(round: Round & Edit): void {
            if (round.editable && !state(this.roundFeedback(round))) return;
            if (round.editable) this.form.rounds = sortRounds(this.form.rounds);
            Vue.set(round, 'editable', !round.editable);
        },
        addRound(): void {
            if (!this.validNewRound) return;
            this.form.rounds = sortRounds(this.form.rounds.concat(this.newRound));
            this.add.round = { name: '', start: '', end: '' };
        },

        challengesFeedback(round: Round): string { return validate.challenges(round.challenges); }
    }
});
</script>

<style scoped lang="scss">
.rounds {
    display: flex;
    justify-content: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    padding-bottom: 0;
}

form {
    width: min(100%, var(--breakpoint-md));
}

.round {
    display: flex;
    flex-wrap: wrap;
    border-bottom: 2px solid black;

    &:not(:last-of-type) {
        margin-bottom: var(--double-margin);
    }

    .round-content {
        width: 0;
        flex-grow: 1;
        margin-right: var(--margin);
        margin-bottom: var(--margin);
    }
    
    .round-name {
        display: block;
        font-weight: bold;
        font-size: var(--font-large);
    }

    .date-time-picker {
        margin-top: var(--margin);
    }

    & > button {
        background-color: var(--white);
    }

    & > :last-child {
        width: 100%;
        margin-bottom: var(--margin);
    }
}

.add-round {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    margin-top: var(--margin);
    margin-bottom: var(--double-margin);

    input, .date-time-picker {
        width: 100%;
        margin-top: var(--margin);
    }
    
    input:first-of-type {
        width: 0;
        flex-grow: 1;
        margin-top: 0;
        margin-right: var(--margin);
    }
}

form > button {
    width: calc(50% - var(--margin) / 2);
    margin-bottom: var(--double-margin);
}

form > .btn-danger {
    margin-right: var(--margin);
}
</style>
