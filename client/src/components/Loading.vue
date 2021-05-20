<template>
    <div class="loading">
        <b-spinner variant=primary type=grow label="Loading..."/>
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
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.spinner-grow {
    width: 25vmin;
    height: 25vmin;
}
</style>
