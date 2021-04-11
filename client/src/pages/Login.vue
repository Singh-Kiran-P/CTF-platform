<template>
    <div class=login>
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
                    required
                ></b-form-input>
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
            password: ""
        }
    }),
    methods: {
        checkForm(e: Event){
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
        }
    },
    computed: {
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
