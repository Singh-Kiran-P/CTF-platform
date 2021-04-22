<template>
    <div class=register>
        <b-form @submit="onSubmit($event)">
            <b-form-group :state="state(registerFeedback)" :invalid-feedback="registerFeedback">
                <b-form-group label=Username label-for=username>
                    <b-form-input
                        id=username
                        type=text
                        v-model="form.username"
                        placeholder="Enter username"
                        :state="state(usernameFeedback)"
                        v-on:input="registerFeedback = ''"
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
                        v-on:input="registerFeedback = ''"
                    />
                    <b-form-input
                        type=password
                        v-model="form.confirmPassword"
                        placeholder="Confirm password"
                        :state="state(passwordFeedback)"
                        v-on:input="registerFeedback = ''"
                    />
                    <b-form-invalid-feedback>{{passwordFeedback}}</b-form-invalid-feedback>
                </b-form-group>

                <b-form-group label=Category label-for=category>
                    <b-form-select
                        id=category
                        v-model="form.category"
                        :options="categories"
                        :state="true"
                    />
                </b-form-group>
            </b-form-group>
            <StatusButton type=submit block variant=primary :state="registerState" normal=Register loading="Registering" succes="Registered" :disabled="!validForm"/>
            <router-link :to="{ name: 'Login'}">Already have an account? Log in</router-link>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import StatusButton from '@/components/StatusButton.vue';
import { state, validInput, validateString, regexPassword, regexName } from '@shared/validate';
import { state, validateUsername, validatePassword, validForm, Form } from '@shared/validation/registerForm';

export default Vue.extend({
    name: 'Register',
    components: {
        StatusButton
    },
    created() {
        this.loadFormCategories();
    },
    data: () => ({
        form: {
            username: '',
            password: '',
            confirmPassword: '',
            category: ''
        },
        categories: [{ value: '', text: 'Select category', disabled: true }] as any[],
        registerState: 'normal',
        registerFeedback: ''
    }),
    
    computed: {
        username(): string { return this.form.username.trim(); },
        password(): string { return this.form.password; },
        confirmPassword(): string { return this.form.confirmPassword; },
        category(): string { return this.form.category; },
        usernameFeedback(): string { return validateUsername(this.username, false); },
        passwordFeedback(): string { return validatePassword(this.password, this.confirmPassword, false); },
        formData(): Form { return { username: this.username, password: this.password, confirmPassword: this.confirmPassword, category: this.category }; },
        validForm(): boolean { return validForm(this.formData) && state(this.registerFeedback); }
    },
    watch: {
        formData: {deep: true, handler() { this.registerState = 'normal'; }}
    },
    methods: {
        state,

        onSubmit(e: Event): void {
            e.preventDefault();
            this.registerState = 'loading';
            const error = (err: string = '') => {
                this.registerState = 'error';
                this.registerFeedback = err;
            }
            axios.post('/api/auth/register', this.formData).then(response => {
                if(response.data.error) return error(response.data.error);
                this.registerState = 'succes';
                location.replace('/#/'); // TODO: use history mode, remove hash
                location.reload();
            }).catch(() => error());
        },
        loadFormCategories(): void {
            axios.get('/api/competition/categories').then(response => {
                if (response.data.error) return; // TODO: show error?
                this.categories = this.categories.concat(response.data);
            });
        }
    }
});
</script>

<style scoped lang="scss">
.register {
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

form #password {
    margin-bottom: var(--margin);
}

form a {
    display: block;
    text-align: center;
    margin-top: var(--margin);
}
</style>
