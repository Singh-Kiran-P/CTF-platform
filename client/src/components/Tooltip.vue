<template>
    <div>
        <div ref=hover>
            <slot/>
        </div>
        <b-tooltip :target="() => $refs['hover']" triggers=hover :placement="(below ? 'bottom' : 'top') + (center ? '' : 'right')" :no-fade="true" :class="{ 'left' : !center }">
            <span class=title>{{title}}</span>
            <span class=content>{{content}}</span>
        </b-tooltip>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'Tooltip',
    props: {
        title: String,
        content: String,
        below: Boolean,
        center: Boolean
    }
});
 
</script>

<style scoped lang="scss">
.tooltip {
    .title, .content {
        display: block;
        word-break: initial;
    }

    .left {
        span {
            text-align: left;
        }
    }

    .title {
        font-weight: bold;
    }
}
</style>
