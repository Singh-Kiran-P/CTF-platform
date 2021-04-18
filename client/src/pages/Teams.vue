<template>
    <div class="teams">
        <span>This is the teams page</span>
        <!--<span v-for="i in 50" :key="i">Team #{{i}}</span>-->
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

export default Vue.extend({
    name: 'Teams',
    created() {
        axios.get('/api/auth/test').then((response) => console.log('none')).catch((err)=>console.log(err)); //test authorisation level of currrent logged in user
    }
});
</script>

<style scoped lang="scss">
span {
  font-weight: bold;
  display: block;
}
</style>
