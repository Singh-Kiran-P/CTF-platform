<template>
    <div class=register>
        <b-form @submit="checkForm">
            <b-form-group id=input-group-username label=Username label-for=username>
                <b-form-input
                    id=username
                    name=username
                    type=text
                    v-model="form.username"
                    placeholder="Enter username"
                    required
                ></b-form-input> 
            </b-form-group>

            <b-form-group id=input-group-password label=Password label-for=password>
                <b-form-input
                    id=password
                    name=password
                    type=password
                    v-model="form.password"
                    :state="passLenCheck"
                    required
                ></b-form-input>

                <!-- This will only be shown if the preceding input has an invalid state -->
                <b-form-invalid-feedback id=input-live-feedback>
                    Enter at least 6 characters
                </b-form-invalid-feedback>
            </b-form-group>

            <b-form-group id=input-group-category label=Category label-for=category>
                <b-form-select
                    id=category
                    name=category
                    placeholder=Select category
                    v-model="form.category"
                    :options="categories"
                    required
                ></b-form-select>
            </b-form-group>

            <b-button type=submit variant=primary>Submit</b-button>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    name: "Register",
    data: () => ({
        form: {
            errors: [] as any,
            username: "",
            password: "",
            category: null
        },
        categories: [ // TODO: have to be loaded from the database instead of hardcoded
            { text: "BAC1", value: 1 },
            { text: "BAC2", value: 2 },
            { text: "BAC3", value: 3 },
            { text: "MASTER", value: 4 }
        ]
    }),
    methods: {
        onSubmit(event: Event) {
            event.preventDefault();
            alert(JSON.stringify(this.form));
        },
        checkForm(e: Event){
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
        }
    },
    computed: {
        passLenCheck(): boolean {
            return this.form.password.length > 6 ? true : false;
        },
        usernameLenCheck(): boolean {
            return this.form.username.length > 3 ? true : false;
        }
    }
});
</script>

<style scoped>
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
