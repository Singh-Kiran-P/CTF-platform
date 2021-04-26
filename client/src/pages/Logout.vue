<template>
    <div class=logout>
        <b-spinner variant=primary type=grow label="Logging out..."/>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

export default Vue.extend({
    name: 'Logout',
    created() {
        axios.get("/api/auth/logout").then(() => {
            location.reload();
            location.replace('/login');
        });
    }
});
</script>

<style scoped lang="scss">
.logout {
    display: flex;
    align-items: center;
    justify-content: center;
}

.spinner-grow {
    width: 25vmin;
    height: 25vmin;
}
</style>
