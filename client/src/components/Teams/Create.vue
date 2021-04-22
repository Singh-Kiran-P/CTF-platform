<template>
    <div id="Create">
        <b-form @submit="onSubmit($event)">
            <b-form-group label=Teamname label-for=teamname>
                <b-form-input
                    id=teamname
                    type=text
                    v-model="form.teamname"
                    placeholder="Enter a name for your team"
                    :state="state(teamnameFeedback)"
                    v-on:input="resetCreateFeedback"
                ></b-form-input> 
                <b-form-invalid-feedback>{{teamnameFeedback}}</b-form-invalid-feedback>
            </b-form-group>        
            <StatusButton type=submit block variant=primary :state="createState" normal=Create loading="Creating" succes="Created" :disabled="!validForm()"/>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import StatusButton from '@/components/StatusButton.vue';
import { state, validInput, validateString, regexPassword, regexName } from '@shared/validate';

export default Vue.extend({
    name: 'Create',
    components: {
        StatusButton
    },
    created() {

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
        form: {deep: true, handler() { this.createState = 'normal'; }}
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
            }).catch(err => alert(err));
        },
        validateTeamname(): string {
            console.log(this.createFeedback);
            if(this.createFeedback != '') return this.createFeedback;
            let feedback = '';
            feedback = validateString(this.form.teamname, 'Teamname', 4, 32, false);
            if(feedback == '' && this.form.teamname.length > 0) {
                return regexName(this.form.teamname, 'Teamname');
            }
            return feedback;
        },
        resetCreateFeedback() {
            this.createFeedback = "";
        },
        state
    }
});
</script>

<style scoped lang="scss">
.register {
    padding: 1rem;
}
form {
    padding-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 50%;
    margin: auto;
}
</style>
