<template>
    <div class="login">
        <span>login form</span>
    </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
    name: "Login",
});
</script>

<style scoped lang="scss">
.login {
    padding: 1rem;
    border-left: 50px solid red;
}

span {
    text-decoration: underline;
}
</style>
