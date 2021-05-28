<template>
    <b-button :size="size" :type="type || 'button'" :block="block" :variant="variant" :disabled="disabled || isLoading || isSucces" @click="$emit('click', $event)">
        <b-spinner v-if="isLoading" small label=loading... />
        <font-awesome-icon v-if="isSucces" icon=check />
        <font-awesome-icon v-if="isError" icon=times />
        {{this.content}}
    </b-button>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'StatusButton',
    props: {
        type: String,
        block: Boolean,
        variant: String,
        disabled: Boolean,
        state: String,
        normal: String,
        loading: String,
        succes: String,
        error: String,
        size: String
    },
    computed: {
        isLoading(): boolean { return this.state == 'loading'; },
        isSucces(): boolean { return this.state == 'succes'; },
        isError(): boolean { return this.state == 'error'; },
        content(): string {
            if (this.isLoading) return this.loading + '...';
            if (this.isSucces) return this.succes;
            if (this.isError) return this.error || 'Retry ' + this.loading;
            return this.normal;
        }
    }
});
</script>
