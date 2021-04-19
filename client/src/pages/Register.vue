<template>
    <div class=register>
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
                    v-on:input="onChangeUsername"
                ></b-form-input>
                <b-form-invalid-feedback>{{passwordFeedback}}</b-form-invalid-feedback>
            </b-form-group>

            <b-form-group id=input-group-category label=Category label-for=category>
                <b-form-select
                    id=category
                    name=category
                    placeholder=Select category
                    v-model="form.category"
                    :options="categories"
                    required
                    :state="state(categoryFeedback)"
                ></b-form-select>
                <b-form-invalid-feedback>{{categoryFeedback}}</b-form-invalid-feedback>
            </b-form-group>
            <router-link :to="{ name: 'Login'}">Already have an account? Click here to log in</router-link>
            <b-button type=submit variant=primary :disabled="!validForm()">Register</b-button>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

export default Vue.extend({
    name: 'Register',
    created() {
        this.loadFormCategories();
    },
    data: () => ({
        form: {
            username: {
                value: '',
                serverError: ''
            },
            password: {
                value: '', 
                serverError: ''
            },
            category: null
        },
        categories: [] as string[],
    }),
    
    computed: {
        usernameFeedback(): string { return this.feedback(this.form.username, 'username', true, 4, 32, []); },
        passwordFeedback(): string { return this.feedback(this.form.password, 'password', true, 6, 32, []); },
        categoryFeedback(): string { return this.form.category ? '' : 'Please select a category' }
    },
    methods: {
        onSubmit(e: Event): void {
            e.preventDefault();
            axios.post('/api/auth/register', {username: this.form.username.value, password: this.form.password.value, category: this.form.category}).then(response => {
                if(response.data.error) {
                    if(response.data.error === "USER_ALREADY_EXISTS") {
                        this.form.username.serverError = "An account with this username already exists";
                    } else {
                        console.log(response.data.error);
                        //notify unknown server error?
                    }
                } else {
                    console.log("succes!");
                    this.$router.push({name: 'Login'})
                }
            }).catch(err => alert(err));
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
        valid(input: string, feedback: string): boolean {
            return input.length > 0 && this.state(feedback);
        },
        validForm(): boolean {
            return this.state(this.usernameFeedback) && this.state(this.passwordFeedback) && this.state(this.categoryFeedback);
        },
        loadFormCategories(): void {
            axios.get('/api/auth/loadCategories').then(response => {
                let data = response.data;
                this.categories = data.categories;
            });
        },
        onChangeUsername(e: Event) {
            this.form.username.serverError = ''; //reset server error on input change
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
