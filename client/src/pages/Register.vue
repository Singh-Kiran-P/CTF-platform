<template>
    <div class="register">
        <b-form @submit="onSubmit">
            <b-form-group id="input-group-username" label="Username" label-for="username">
                <b-form-input
                    id="username"
                    type="text"
                    v-model="form.username"
                    placeholder="Enter username"
                    required
                />
            </b-form-group>

            <b-form-group id="input-group-password" label="Password" label-for="password">
                <b-form-input
                    id="password"
                    type="password"
                    v-model="form.password"
                    :state="passLenCheck"
                    required
                />

                <!-- This will only be shown if the preceding input has an invalid state -->
                <b-form-invalid-feedback id="input-live-feedback">
                    Enter at least 6 characters
                </b-form-invalid-feedback>
            </b-form-group>

            <b-form-group id="input-group-category" label="Category" label-for="category">
                <b-form-select
                    id="category"
                    placeholder="Select category"
                    v-model="form.category"
                    :options="categories"
                    required
                />
            </b-form-group>

            <b-button type="submit" variant="primary">Submit</b-button>
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
    methods: {
        onSubmit(event: Event) {
            event.preventDefault();
            alert(JSON.stringify(this.form));
        }
    },
    computed: {
        passLenCheck(): boolean {
            return this.form.password.length > 6 ? true : false;
        }
    }
});
</script>

<style scoped lang="scss">
.register {
    padding: 1rem;
}
</style>
