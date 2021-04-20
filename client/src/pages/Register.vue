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
                    ></b-form-input> 
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
                    ></b-form-input>
                    <b-form-invalid-feedback>{{passwordFeedback}}</b-form-invalid-feedback>
                </b-form-group>

                <b-form-group label=Category label-for=category>
                    <b-form-select
                        id=category
                        placeholder="Select category"
                        v-model="form.category"
                        :options="categories"
                        required
                        :state="state(categoryFeedback)"
                    ></b-form-select>
                    <b-form-invalid-feedback>{{categoryFeedback}}</b-form-invalid-feedback>
                </b-form-group>
            </b-form-group>
            <StatusButton type=submit block variant=primary :state="registerState" normal=Register loading="Registering" succes="Registered" :disabled="!validForm()"/>
            <router-link :to="{ name: 'Login'}">Already have an account? Click here to log in</router-link>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';
import StatusButton from '@/components/StatusButton.vue';
import { state, validInput, validateString } from '@shared/validate';

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
            category: ''
        },
        categories: [] as string[],
        registerState: 'normal',
        registerFeedback: ''
    }),
    
    computed: {
        usernameFeedback(): string { return validateString(this.form.username, 'Username', 4, 32, false); },
        passwordFeedback(): string { return validateString(this.form.password, 'Password', 6, 32, false); },
        categoryFeedback(): string { return this.form.category ? '' : 'Please select a category' } 
    },
    watch: {
        form: {deep: true, handler() { this.registerState = 'normal'; }}
    },
    methods: {
        state,
        validForm(): boolean { return validInput(this.usernameFeedback, this.form.username) && validInput(this.passwordFeedback, this.form.password) && validInput(this.categoryFeedback, this.form.category) && state(this.registerFeedback); },
        onSubmit(e: Event): void {
            e.preventDefault();
            this.registerState = 'loading';
            const error = (err: string = '') => {
                this.registerState = 'error';
                this.registerFeedback = err;
            }
            axios.post('/api/auth/register', {username: this.form.username, password: this.form.password, category: this.form.category}).then(response => {
                if(response.data.error) return error(response.data.console.error);
                this.registerState = 'succes';
                location.replace('/#/'); // TODO: use history mode, remove hash
                location.reload();
            }).catch(() => error());
        },
        loadFormCategories(): void {
            axios.get('/api/competition/categories').then(response => {
                this.categories = response.data;
            });
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
a {
    padding-bottom: 1rem;
}
</style>
