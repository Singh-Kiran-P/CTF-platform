<template>
    <div :class="{ 'instant': instant }">
        <div :class="['header', { 'center': center, 'left': left }]" @click="toggle()">
            <span :class="{ 'large': large }">{{label}}
                <Tooltip v-if="infoTitle || infoContent" :title="infoTitle" :content="infoContent" :center="center" class=info-tooltip>
                    <font-awesome-icon icon=info-circle />
                </Tooltip>
            </span>
            <IconButton icon=chevron-down :loading="loading" :class="visible ? 'danger' : 'primary'"/>
        </div>
        <b-collapse :visible="visible" :class="{ 'no-border': noborder }">
            <slot/>
        </b-collapse>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Tooltip from './Tooltip.vue';
import IconButton from './IconButton.vue';

export default Vue.extend({
    name: 'Collapse',
    components: {
        IconButton,
        Tooltip
    },
    props: {
        value: Boolean,
        label: String,
        large: Boolean,
        center: Boolean,
        left: Boolean,
        noborder: Boolean,
        loading: Boolean,
        instant: Boolean,
        infoTitle: String,
        infoContent: String
    },
    data: () => ({
        state: false
    }),
    created() {
        this.state = this.value;
    },
    computed: {
        visible(): boolean {
            return this.state && !this.loading;
        }
    },
    watch: {
        value(): void {
            this.state = this.value;
        }
    },
    methods: {
        toggle(): void {
            this.state = !this.state;
            this.$emit('input', this.state);
            this.$emit('toggle');
        }
    }
});
</script>

<style scoped lang="scss">
.collapse {
    width: 100%;
    margin-top: 0 !important;
}

.collapse:not(.no-border) {
    border-bottom: var(--border-c) solid var(--black-c);
}

.instant .collapsing {
    -webkit-transition: none;
    transition: none;
    display: none;
}

.info-tooltip {
    display: inline-block;
    color: var(--info);
}

.header {
    width: 100%;
    display: flex;
    align-items: center;

    &:not(.left) {
        justify-content: center;
    }

    &:not(.center):not(.left) span {
        flex-grow: 1;
    }

    span {
        padding-right: var(--margin);
        display: inline;
        margin-bottom: 0;
        font-weight: bold;

        &.large {
            font-size: var(--font-large);
        }
    }

    button {
        flex-shrink: 0;
        color: var(--black-c) !important;
    }

    button.danger {
        transform: rotate(180deg);
    }
}
</style>
