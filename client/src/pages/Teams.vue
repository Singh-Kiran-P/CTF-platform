<template>
    <div class="teams">
        <span>This is the teams page</span>
        <span v-for="i in 50" :key="i">Team #{{i}}</span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'Teams'
});
</script>

<style scoped lang="scss">
span {
    font-weight: bold;
    display: block;
}
</style>
