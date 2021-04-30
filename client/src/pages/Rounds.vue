<template>
    <div class=rounds>
        <b-form @submit="onSubmit($event)">
            <b-form-group :state="state(roundsFeedback)" :invalid-feedback="roundsFeedback">
                <div class=round v-for="(round, i) in form.rounds" :key="i /* TODO */">
                    cdscds<br/>edwdewed
                    <b-form-invalid-feedback>{{roundFeedback(round)}}</b-form-invalid-feedback>

                    <b-form-group :state="state(challengesFeedback(round))" :invalid-feedback="challengesFeedback(round)">
                        <Collapse label=Challenges>
                            <div class=challenge v-for="(challenge, i) in round.challenges" :key="i /* TODO */">
                                qwefff<br/>edwderewrfwfwed<br/>ljkdncncsndc
                            </div>
                        </Collapse>
                    </b-form-group>
                </div>
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
import { state, validInput, validForm, validate, Challenge, Round, Form } from '@shared/validation/roundsForm';
import { serialize } from '@shared/objectFormdata';

export default Vue.extend({
    name: 'Rounds',
    components: {
        Collapse,
        IconButton,
        StatusButton
    },
    created() {
        this.loadFormData();
    },
    data: () => ({
        form: {
            rounds: [] as Round[]
        },

        loaded: false,
        saveState: 'normal',
        cancelState: 'normal'
    }),
    computed: {
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
            // TODO
            const error = () => {
                this.cancelState = 'error';
                this.saveState = 'normal';
            }
            axios.get('/api/rounds/data').then(res => {
                let data: Form = res.data;
                console.log(data);
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

        challengesFeedback(round: Round): string { return validate.challenges(round.challenges); },
        roundFeedback(round: Round): string { return validate.round(round); }
    }
});
</script>

<style scoped lang="scss">
.rounds {
    display: flex;
    justify-content: center;
    padding: var(--double-margin);
    padding-bottom: 0;
}

form {
    width: min(100%, var(--breakpoint-md));
}



form > button {
    width: calc(50% - var(--margin) / 2);
    margin-bottom: var(--double-margin);
}

form > .btn-danger {
    margin-right: var(--margin);
}
</style>
