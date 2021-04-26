<template>
    <div id="Loading">
        <div class="loading">
            <b-spinner name=loading_icon label="Loading"></b-spinner>
        </div>
        <label for="loading_icon">Loading</label>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'Loading'
});
 
</script>

<style scoped lang="scss">
.loading {
    margin: auto;
    position: absolute;
    top: 50%;
    left: 47%;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
}
label {
    position: absolute;
    left: 46%;
    top: 44%;
}
</style>
