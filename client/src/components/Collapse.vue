<template>
    <div>
        <div :class="['header', { 'center': center, 'left': left }]" @click="toggle()">
            <label :class="{ 'large': large }">{{label}}</label>
            <IconButton icon="chevron-down" :loading="loading" :class="visible ? 'danger' : 'primary'"/>
        </div>
        <b-collapse :visible="visible" :class="{ 'no-border': noborder }">
            <slot/>
        </b-collapse>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import IconButton from './IconButton.vue';

export default Vue.extend({
    name: 'Collapse',
    components: {
        IconButton
    },
    props: {
        value: Boolean,
        label: String,
        large: Boolean,
        center: Boolean,
        left: Boolean,
        noborder: Boolean,
        loading: Boolean
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
    margin-top: 0 !important;
}

.collapse:not(.no-border) {
    border-bottom: 2px solid var(--black);
}

.header {
    display: flex;
    align-items: center;

    &:not(.left) {
        justify-content: center;
    }

    &:not(.center):not(.left) label {
        flex-grow: 1;
    }

    label {
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
    }

    button.danger {
        transform: rotate(180deg);
    }
}
</style>
