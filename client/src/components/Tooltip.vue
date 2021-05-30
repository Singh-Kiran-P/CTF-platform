<template>
    <div>
        <div class=hover ref=hover>
            <slot/>
        </div>
        <b-tooltip v-if="title || content" :target="() => $refs['hover']" triggers=hover :show="show"
            :placement="(below ? 'bottom' : 'top') + (center ? '' : (left ? 'left' : 'right'))" no-fade>
            <div :class="{ 'left': !center }">
                <span class=title v-html="title"/>
                <span class=content v-html="content"/>
            </div>
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
        left: Boolean,
        show: Boolean
    }
});
</script>

<style scoped lang="scss">
.tooltip {
    .left {
        text-align: left;
    }

    .title, .content {
        display: block;
        word-break: normal;
    }

    .title {
        font-weight: bold;
    }
}
</style>
