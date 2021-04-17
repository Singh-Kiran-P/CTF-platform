<template>
    <div class=login>
        <b-form @submit="onSubmit($event)">
            <b-form-group id=input-group-username label=Username label-for=username>
                <b-form-input
                    id=username
                    name=username
                    type=text
                    v-model="form.username.value"
                    placeholder="Enter username"
                    required
                    :state="state(usernameFeedback)"
                    v-on:input="onChangeUsername"
                ></b-form-input> 
                <b-form-invalid-feedback>{{usernameFeedback}}</b-form-invalid-feedback>
            </b-form-group>

            <b-form-group id=input-group-password label=Password label-for=password>
                <b-form-input
                    id=password
                    name=password
                    type=password
                    v-model="form.password.value"
                    required
                    :state="state(passwordFeedback)"
                    v-on:input="onChangePassword"
                ></b-form-input> 
                <b-form-invalid-feedback>{{passwordFeedback}}</b-form-invalid-feedback>
            </b-form-group>
            <router-link :to="{ name: 'Register'}">No account? Click here to register</router-link>
            <b-button type=submit variant=primary>Submit</b-button>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios"

export default Vue.extend({
    name: "Login",
    data: () => ({
        form: {
            username: {
                value: '',
                serverError: ''
            },
            password: {
                value: '', 
                serverError: ''
            }
        }
    }),
    computed: {
        usernameFeedback(): string { return this.feedback(this.form.username, 'username', true, 4, 32, []); },
        passwordFeedback(): string { return this.feedback(this.form.password, 'password', true, 6, 32, []); },
    },
    methods: {
        onSubmit(e: Event): void {
            e.preventDefault();
            axios.post('/api/auth/login', {username: this.form.username.value, password: this.form.password.value}).then(response => {
                if(response.data.error) {
                    console.log('error');
                    if(response.data.error === "USER_NOT_FOUND") {
                        this.form.username.serverError = "No account with this username was found";
                    } else if (response.data.error === "WRONG_PASSWORD") {
                        this.form.password.serverError = "Wrong password";
                    } else {
                        console.log(response.data.error);
                        //notify unknown server error?
                    }
                } else { //succesfully logged in
                    console.log("succesful login!");
                    //TODO: Load correct routes
                    //axios.get('/api/auth/getUser').then(()=>console.log('session revieved')).catch(()=>alert('Internal error'));
                }
            }).catch(()=> alert('Internal error'));
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
        },
        onChangeUsername(e: Event) {
            this.form.username.serverError = ''; //reset server error on input change
        },
        onChangePassword(e: Event) {
            this.form.password.serverError = ''; //reset server error on input change
        }
    }
});
</script>

<style scoped lang="scss">
.login {
    padding: 1rem;
}
/*.form-group {
    width: 50%;
    margin: auto;
}*/
form {
    padding-top: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 50%;
    margin: auto;
}
a {
    padding-bottom: 1rem;
}
</style>
