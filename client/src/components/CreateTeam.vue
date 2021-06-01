<template>
    <div class="create">
        <b-form @submit="onSubmit($event)">
            <b-form-group label="Team name" label-for=teamname>
                <b-form-input
                    id=teamname
                    type=text trim
                    v-model="form.teamname"
                    placeholder="Enter team name"
                    :state="state(teamnameFeedback)"
                    @input="resetCreateFeedback"
                ></b-form-input>
                <b-form-invalid-feedback>{{teamnameFeedback}}</b-form-invalid-feedback>
            </b-form-group>
            <StatusButton type=submit block variant=primary :state="createState" normal="Create" loading="Creating" succes="Created" :disabled="!validForm()"/>
            <span>Want to join a team? Ask the captain for an invite link!</span>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import StatusButton from '@/components/StatusButton.vue';
import { state, validInput, validateString, regexName } from '@shared/validation';

export default Vue.extend({
    name: 'CreateTeam',
    components: {
        StatusButton
    },
    data: () => ({
        form: {
            teamname: ''
        },
        createState: 'normal',
        createFeedback: ''
    }),
    computed: {
        teamnameFeedback(): string { return this.validateTeamname(); },
    },
    watch: {
        form: { deep: true, handler() { this.createState = 'normal'; }}
    },
    methods: {
        validForm(): boolean { return validInput(this.teamnameFeedback, this.form.teamname) && state(this.createFeedback); },
        onSubmit(e: Event): void {
            e.preventDefault();
            this.createState = 'loading';
            const error = (err: string = '') => {
                this.createState = 'error';
                this.createFeedback = err;
            }
            axios.post('/api/team/register', {teamname: this.form.teamname}).then(response => {
                if(response.data.error) return error(response.data.error);
                this.createState = 'succes';
                this.$router.go(0); // page reload
            }).catch(() => error('Error creating team'));
        },
        validateTeamname(): string {
            if(this.createFeedback != '') return this.createFeedback;
            let feedback = validateString(this.form.teamname, 'Team name', 3, 32, false);
            if (feedback) return feedback;
            return regexName(this.form.teamname, 'Team name');
        },
        resetCreateFeedback() {
            this.createFeedback = "";
        },
        state
    }
});
</script>

<style scoped lang="scss">
.create {
    display: flex;
    justify-content: center;
    padding: var(--double-margin);
    padding-bottom: 0;
}

form {
    width: min(100%, var(--breakpoint-sm));
}

form > .form-group {
    margin-bottom: var(--double-margin);
}
</style>
