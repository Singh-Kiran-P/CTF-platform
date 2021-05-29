<template>
    <b-button type=button :class="['icon', { toggled: toggled }, { darker: toggled && !icon2 }]" :disabled="disabled" @click="$emit('click', $event)">
        <b-spinner v-if="loading" small/>
        <font-awesome-icon v-else :icon="toggled && icon2 ? icon2 : icon" />
    </b-button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'StatusButton',
    props: {
        type: String,
        variant: String,
        disabled: Boolean,
        toggled: Boolean,
        loading: Boolean,
        icon: String,
        icon2: String
    }
});
</script>

<style scoped lang="scss">
button.icon {
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius);
    background-color: var(--gray-light);
    box-shadow: none !important;
    color: var(--black-c);
    outline: none;
    border: none;
}

button.icon.toggled {
    background-color: initial;
    color: var(--info);
}

@media (hover: hover) {
    button.icon:hover:not(:disabled), button.icon:focus-visible {
        &.icon {
            background-color: var(--gray-c);
            color: var(--white-c);
        }

        &.darker {
            color: var(--gray-light);
        }

        &.primary {
            background-color: var(--primary);
        }

        &.danger {
            background-color: var(--danger);
        }

        &.info {
            background-color: var(--info);
        }
    }
}

button.icon:active:not(:disabled) {
    &.icon {
        background-color: var(--gray-c);
        color: var(--white-c);
    }

    &.darker {
        color: var(--gray-light);
    }

    &.primary {
        background-color: var(--primary);
    }

    &.danger {
        background-color: var(--danger);
    }

    &.info {
        background-color: var(--info);
    }
}
</style>
