<template>
    <div class=register>
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
            <b-button type=submit variant=primary>Submit</b-button>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'Register',
    data: () => ({
        form: {
            username: '',
            password: '',
            category: null
        },
        categories: [ // TODO: have to be loaded from the database instead of hardcoded
            { text: 'BAC1', value: 1 },
            { text: 'BAC2', value: 2 },
            { text: 'BAC3', value: 3 },
            { text: 'MASTER', value: 4 }
        ]
    }),
    
    computed: {
        usernameFeedback(): string { return this.feedback(this.form.username, 'username', true, 4, 32, []); },
        passwordFeedback(): string { return this.feedback(this.form.password, 'password', true, 6, 32, []); },
        categoryFeedback(): string { return this.form.category ? '' : 'Please select a category' }
    },
    methods: {
        /*checkForm(e: Event){
            this.form.errors = [];
            if(!this.form.username) {
                this.form.errors.push("Username is required");
            } else if (this.form.username.length < 4) {
                this.form.errors.push("Username length should be at least 4");
            } else if(!this.form.category) {
                this.form.errors.push("Please select a category");
            } else if(this.form.password.length < 6){
                this.form.errors.push("Password lengths should be at least 6");
            }
            if (!this.form.errors.length) {
                return true;
            }
            e.preventDefault();
        }*/
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

<style scoped lang="scss">
.register {
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
