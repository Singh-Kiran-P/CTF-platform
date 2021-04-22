<template>
    <div class=login>
        <b-form @submit="onSubmit($event)">
            <b-form-group :state="state(loginFeedback)" :invalid-feedback="loginFeedback">
                <b-form-group label=Username label-for=username>
                    <b-form-input
                        id=username
                        type=text
                        v-model="form.username"
                        placeholder="Enter username"
                        :state="state(usernameFeedback)"
                        v-on:input="loginFeedback = ''"
                    />
                    <b-form-invalid-feedback>{{usernameFeedback}}</b-form-invalid-feedback>
                </b-form-group>

                <b-form-group label=Password label-for=password>
                    <b-form-input
                        id=password
                        type=password
                        v-model="form.password"
                        placeholder="Enter password"
                        :state="state(passwordFeedback)"
                        v-on:input="loginFeedback = ''"
                    />
                    <b-form-invalid-feedback>{{passwordFeedback}}</b-form-invalid-feedback>
                </b-form-group>
            </b-form-group>
            <StatusButton type=submit block variant=primary :state="loginState" normal=Login loading="Logging in" succes="Logged in" :disabled="!validForm()"/>
            <router-link :to="{ name: 'Register' }">Don't have an account yet? Register</router-link>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import StatusButton from '@/components/StatusButton.vue';
import { state, validInput, validateString } from '@shared/validation';

export default Vue.extend({
    name: 'Login',
    components: {
        StatusButton
    },
    data: () => ({
        form: {
            username: '',
            password: ''
        },
        loginState: 'normal',
        loginFeedback: ''
    }),
    computed: {
        username(): string { return this.form.username.trim(); },
        password(): string { return this.form.password; },
        usernameFeedback(): string { return validateString(this.username, 'Username', 4, 32, false); },
        passwordFeedback(): string { return validateString(this.password, 'Password', 6, 32, false); }
    },
    watch: {
        form: { deep: true, handler() { this.loginState = 'normal'; }}
    },
    methods: {
        state,
        validForm(): boolean { return validInput(this.usernameFeedback, this.username) && validInput(this.passwordFeedback, this.password) && state(this.loginFeedback); },

        onSubmit(e: Event): void {
            e.preventDefault();
            this.loginState = 'loading';
            const error = (err: string = '') => {
                this.loginState = 'error';
                this.loginFeedback = err;
            }
            axios.post('/api/auth/login', { username: this.username, password: this.password }).then(response => {
                if(response.data.error) return error(response.data.error);
                this.loginState = 'succes';
                location.replace('/#/'); // TODO: use history mode, remove hash
                location.reload();
            }).catch(() => error());
        },
    }
});
</script>

<style scoped lang="scss">
.login {
    display: flex;
    justify-content: center;
    padding: var(--double-margin);
    padding-bottom: 0;
}

form {
    width: min(100%, 500px);
}

form > .form-group {
    margin-bottom: 0;
}

form a {
    display: block;
    text-align: center;
    margin-top: var(--margin);
}
</style>
