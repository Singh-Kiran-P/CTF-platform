<template>
    <div id="Create">
        <b-form @submit="onSubmit($event)">
            <b-form-group id=input-group-teamname label=Teamname label-for=teamname>
                <b-form-input
                    id=teamname
                    name=teamname
                    type=text
                    v-model="form.teamname.value"
                    placeholder="Enter a name for your team"
                    required
                    :state="state(teamnameFeedback)"
                ></b-form-input> 
                <b-form-invalid-feedback>{{teamnameFeedback}}</b-form-invalid-feedback>
            </b-form-group>        
            <b-button type=submit variant=primary>Create Team</b-button>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

export default Vue.extend({
    name: 'Create',
    data: () => ({
        form: {
            teamname: {
                value: '',
                serverError: ''
            }
        }
    }),
    computed: {
        teamnameFeedback(): string { return this.feedback(this.form.teamname, 'teamname', true, 4, 32, []); },
    },
    methods: {
        onSubmit(e: Event): void {
            e.preventDefault();
            axios.post('/api/team/register', {teamname: this.form.teamname.value}).then(response => {
                if(response.data.error) {
                    if(response.data.error === "TEAM_ALREADY_EXISTS") {
                        this.form.teamname.serverError = "A team with this name already exists";
                    } else {
                        console.log(response.data.error);
                    }
                } else {
                    console.log("succes!");
                    this.$router.replace('Team');
                }
            }).catch(err => alert(err));
            // TODO: store in database and perform server side validation
        },
        feedback(input: any, name: string, required: boolean, min: number, max: number, others: string[]): string {
            let l = input.value.length;
            if(input.serverError) return input.serverError;
            if (required && l == 0) return `${name} is required`;
            if (others.includes(input.value)) return `${name} already exists`;
            if (l && l < min) return `${name} must be at least ${min} characters`;
            else if (l > max) return `${name} must be at most ${max} characters`;
            return '';
        },
        state(feedback: string): boolean {
            return feedback.length == 0;
        }
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
