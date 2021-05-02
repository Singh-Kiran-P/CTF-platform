<template>
    <div class=register>
        <b-form @submit="onSubmit($event)">
            <b-form-group :state="state(registerFeedback)" :invalid-feedback="registerFeedback">
                <b-form-group label=Username label-for=username>
                    <b-form-input
                        id=username
                        type=text trim
                        v-model="form.username"
                        placeholder="Enter username"
                        :state="state(usernameFeedback)"
                        @input="usernameError = ''"
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
                    />
                    <b-form-input
                        type=password
                        v-model="form.confirmPassword"
                        placeholder="Confirm password"
                        :state="state(passwordFeedback)"
                    />
                    <b-form-invalid-feedback>{{passwordFeedback}}</b-form-invalid-feedback>
                </b-form-group>

                <b-form-group label=Category label-for=category>
                    <b-form-select
                        id=category
                        v-model="form.category"
                        :options="categories"
                        :state="state(categoryFeedback)"
                        @input="categoryFeedback = ''"
                    />
                    <b-form-invalid-feedback>{{categoryFeedback}}</b-form-invalid-feedback>
                </b-form-group>
            </b-form-group>
            <StatusButton type=submit block variant=primary :state="registerState" normal=Register loading="Registering" succes="Registered" :disabled="!validForm"/>
            <router-link :to="{ name: 'Login' }">Already have an account? Log in</router-link>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import StatusButton from '@/components/StatusButton.vue';
import { validateUsername, validatePassword, validForm, Form } from '@shared/validation/registerForm';
import { state, is } from '@shared/validation';

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
        } as Form,
        categories: [{ value: '', text: 'Select category', disabled: true }] as any[],
        registerState: 'normal',
        registerFeedback: '',
        usernameError: '',
        categoryFeedback: ''
    }),
    
    computed: {
        usernameFeedback(): string { return this.usernameError || validateUsername(this.form.username, false); },
        passwordFeedback(): string { return validatePassword(this.form.password, this.form.confirmPassword, false); },
        validForm(): boolean { return validForm(this.form) && state(this.usernameFeedback); }
    },
    watch: {
        form: {deep: true, handler() {
            this.registerState = 'normal';
            this.registerFeedback = '';
        }}
    },
    methods: {
        state,

        onSubmit(e: Event): void {
            e.preventDefault();
            this.registerState = 'loading';
            const error = (err?: any) => {
                this.registerState = 'error';
                if (is.string(err)) this.registerFeedback = err;
                else if (is.object(err)) {
                    if (is.string(err.username)) this.usernameError = err.username;
                    if (is.string(err.category)) this.categoryFeedback = err.category;
                }
            }
            axios.post('/api/auth/register', this.form).then(response => {
                if(response.data.error) return error(response.data.error);
                this.registerState = 'succes';
                location.reload();
                location.replace('/');
            }).catch(() => error());
        },
        loadFormCategories(): void {
            axios.get('/api/competition/categories').then(response => {
                if (response.data.error) return this.categoryFeedback = response.data.error;
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
    width: min(100%, var(--breakpoint-sm));
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
