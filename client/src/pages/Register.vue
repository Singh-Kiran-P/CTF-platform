<template>
    <div class="register">
        <b-form @submit="onSubmit" v-if="show">
            <b-form-group id="input-group-username" label="Username:" label-for="username">
                <b-form-input
                    id="username"
                    v-model="form.username"
                    type="username"
                    placeholder="Enter username"
                    required
                ></b-form-input>
            </b-form-group>

            <b-form-group id="input-group-password" label="Password:" label-for="password">
                <b-form-input
                    id="password"
                    type="password"
                    v-model="form.password"
                    :state="passLenCheck"
                    required
                ></b-form-input>

                <!-- This will only be shown if the preceding input has an invalid state -->
                <b-form-invalid-feedback id="input-live-feedback">
                Enter at least 6 characters
                </b-form-invalid-feedback>
            </b-form-group>

            <b-form-group id="input-group-categorie" label="Categorie:" label-for="categorie">
                <b-form-select
                    id="category"
                    placeholder="Selecteer categorie"
                    v-model="form.category"
                    :options="categories"
                    required
                ></b-form-select>
            </b-form-group>

            <b-button type="submit" variant="primary">Submit</b-button>
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    name: "Register",
    data() {
        return {
            form: {
                username: "",
                password: "",
                category: null
            },
            categories: [ //TODO: deze moeten uit de database geladen, zijn nu hardcoded
                { text: "BAC1", value: 1 },
                { text: "BAC2", value: 2 },
                { text: "BAC3", value: 3 },
                { text: "MASTER", value: 4 }               
            ],
            show: true,
        };
    },
    methods: {
        onSubmit(event: Event) {
            event.preventDefault();
            alert(JSON.stringify(this.form));
        },
    },
    computed: {
        passLenCheck(): boolean {
            return (this.form.password.length > 6 ? true : false)
        }
    }
});
</script>

<style scoped>
* {
    margin: 1rem;
}
</style>
