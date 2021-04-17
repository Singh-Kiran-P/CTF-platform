<template>
    <div id=app>
        <PageBar/>
        <div id=page>
            <router-view/>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import PageBar from '@/components/PageBar.vue';

export default Vue.extend({
    name: 'App',
    components: {
        PageBar
    }
});
</script>

<style lang="scss">
@import '@/assets/css/custom.scss';

#app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

#pageBar, #page {
    width: 100%;
}

#page {
    height: 100%;
    display: flex;
    flex-shrink: 1;
    overflow: auto;
}

#page > iframe, #page > div {
    width: 100%;
    max-width: 100%;
    min-height: 100%;
    overflow: auto;
}

#page > iframe {
    border: none;
}
</style>
