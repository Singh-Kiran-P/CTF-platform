<template>
    <div class=live-feed>
        <div>
            TODO brur rubruhbruhbr
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import axios from 'axios';

export default Vue.extend({
    name: 'LiveFeed',
    components: {

    },
    created() {
        
    },
    data: () => ({

    }),
    computed: {

    },
    methods: {

    }
});
</script>

<style scoped lang="scss">
.live-feed {
    display: flex;
    justify-content: center;
    overflow-y: scroll !important;
    padding: var(--double-margin);
    padding-bottom: 0;

    & > div {
        width: min(100%, var(--breakpoint-sm));
    }
}
</style>
