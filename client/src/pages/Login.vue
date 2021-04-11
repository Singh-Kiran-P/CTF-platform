<template>
    <div class=login>
        <b-form @submit="onSubmit($event)">
            <b-form-group id=input-group-username label=Username label-for=username>
                <b-form-input
                    id=username
                    name=username
                    type=text
                    v-model="form.username"
                    placeholder="Enter username"
                    required
                    :state="state(usernameFeedback)"
                ></b-form-input> 
                <b-form-invalid-feedback>{{usernameFeedback}}</b-form-invalid-feedback>
            </b-form-group>

            <b-form-group id=input-group-password label=Password label-for=password>
                <b-form-input
                    id=password
                    name=password
                    type=password
                    v-model="form.password"
                    required
                    :state="state(passwordFeedback)"
                ></b-form-input> 
                <b-form-invalid-feedback>{{passwordFeedback}}</b-form-invalid-feedback>
            </b-form-group>
            <b-button type=submit variant=primary>Submit</b-button>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    name: "Login",
    data: () => ({
        form: {
            username: "",
            password: ""
        }
    }),
    computed: {
        usernameFeedback(): string { return this.feedback(this.form.username, 'username', true, 4, 32, []); },
        passwordFeedback(): string { return this.feedback(this.form.password, 'password', true, 6, 32, []); },
    },
    methods: {
        /*checkForm(e: Event){
            this.form.errors = [];

            if(!this.form.username) {
                this.form.errors.push("Username is required");
            } else if (this.form.username.length < 4) {
                this.form.errors.push("Username length should be at least 4");
            } else if(this.form.password.length < 6){
                this.form.errors.push("Password lengths should be at least 6");
            }

            if (!this.form.errors.length) {
                return true;
            }

            e.preventDefault();
        },*/
        onSubmit(e: Event): void {
            e.preventDefault();
            // TODO: store in database and perform server side validation
        },
        feedback(input: string, name: string, required: boolean, min: number, max: number, others: string[]): string {
            let l = input.length;
            if (required && l == 0) return `${name} is required`;
            if (others.includes(input)) return `${name} already exists`;
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

<style scoped>
.login {
    padding: 1rem;
}
/*.form-group {
    width: 50%;
    margin: auto;
}*/
form {
    padding: 1rem;
    text-align: center;
    width: 50%;
    margin: auto;
}
</style>
