<template>
    <div>
        <div class=hover ref=hover>
            <slot/>
        </div>
        <b-tooltip v-if="title || content" :target="() => $refs['hover']" triggers=hover :show="show"
            :placement="(below ? 'bottom' : 'top') + (center ? '' : 'right')" no-fade :class="{ 'left' : !center }">
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
        center: Boolean,
        show: Boolean
    }
});
 
</script>

<style scoped lang="scss">
.hover > svg {
    vertical-align: middle;
}

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
