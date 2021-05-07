<template>
    <div class="login">
        <b-form @submit="onSubmit($event)">
            <b-form-group
                :state="state(loginFeedback)"
                :invalid-feedback="loginFeedback"
            >
                <b-form-group label="Username" label-for="username">
                    <b-form-input
                        id="username"
                        type="text"
                        v-model="form.username"
                        placeholder="Enter username"
                        v-on:input="
                            usernameFeedback = '';
                            passwordFeedback = '';
                        "
                        :state="state(usernameFeedback)"
                    />
                    <b-form-invalid-feedback>{{
                        usernameFeedback
                    }}</b-form-invalid-feedback>
                </b-form-group>

                <b-form-group label="Password" label-for="password">
                    <b-form-input
                        id="password"
                        type="password"
                        v-model="form.password"
                        placeholder="Enter password"
                        v-on:input="passwordFeedback = ''"
                        :state="state(passwordFeedback)"
                    />
                    <b-form-invalid-feedback>{{
                        passwordFeedback
                    }}</b-form-invalid-feedback>
                </b-form-group>
            </b-form-group>
            <StatusButton
                type="submit"
                block
                variant="primary"
                :state="loginState"
                normal="Login"
                loading="Logging in"
                succes="Logged in"
                :disabled="!validForm()"
            />
            <router-link :to="{ name: 'Register' }"
                >Don't have an account yet? Register</router-link
            >
        </b-form>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import axios from "axios";
import StatusButton from "@/components/StatusButton.vue";
import { state, validInput, is } from "@shared/validation";
export default Vue.extend({
    name: "Login",
    components: {
        StatusButton,
    },
    created() {},

    data: () => ({
        form: {
            username: "",
            password: "",
        },
        loginState: "normal",
        loginFeedback: "",
        usernameFeedback: "",
        passwordFeedback: "",
    }),
    computed: {
        username(): string {
            return this.form.username.trim();
        },
        password(): string {
            return this.form.password;
        },
    },
    watch: {
        form: {
            deep: true,
            handler() {
                this.loginState = "normal";
                this.loginFeedback = "";
            },
        },
    },
    methods: {
        state,
        validForm(): boolean {
            return (
                validInput(this.usernameFeedback, this.username) &&
                validInput(this.passwordFeedback, this.password)
            );
        },
        onSubmit(e: Event): void {
            e.preventDefault();
            this.loginState = "loading";
            const error = (err?: any) => {
                this.loginState = "error";
                if (is.string(err)) this.loginFeedback = err;
                else if (is.object(err)) {
                    if (is.string(err.username))
                        this.usernameFeedback = err.username;
                    if (is.string(err.password))
                        this.passwordFeedback = err.password;
                }
            };
            axios
                .post("/api/auth/login", {
                    username: this.username,
                    password: this.password,
                })
                .then((response) => {
                    if (response.data.error) return error(response.data.error);
                    this.loginState = "succes";
                    location.reload();
                    location.replace("/");
                })
                .catch(() => error());
        },
    },
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
    width: min(100%, var(--breakpoint-sm));
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
