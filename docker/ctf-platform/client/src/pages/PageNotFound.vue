<template>
    <div class="pageNotFound">
        <span>404 page not found</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'PageNotFound'
});
</script>

<style scoped>
.pageNotFound {
    display: flex;
    align-items: center;
    justify-content: center;
}

span {
    font-size: 2rem;
}
</style>
