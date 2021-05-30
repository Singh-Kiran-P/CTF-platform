<template>
    <div class=admin-header>
        <div class=disclaimer>
            <span>Viewing as organizer</span>
            <Tooltip below class=header-tooltip title="You are logged in as an organizer"
                content="
                As an organizer you cannot join the competition, instead you can view the competition as a participant would, but with all challenges unlocked and active<br/><br/>
                Any action you take will visually show but won't actually be stored anywhere, allowing you to freely test your competition">
                <font-awesome-icon icon=info-circle />
            </Tooltip>
        </div>

        <div v-if="options" class=options>
            <b-select v-model="option" :options="roundOptions"/>
            <Tooltip left below class=header-tooltip title="Active round"
                content="Select the round to be shown as active, this change only happens locally and is merely meant for testing purposes">
                <font-awesome-icon icon=info-circle />
            </Tooltip>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Tooltip from '@/components/Tooltip.vue';

export default Vue.extend({
    name: 'AdminHeader',
    components: {
        Tooltip
    },
    props: {
        names: Array,
        times: Array
    },
    data: () => ({
        value: 0,
        option: 0,
        time: new Date()
    }),
    computed: {
        options(): boolean { return this.names?.length > 0 && this.times?.length > 0; },
        roundNames(): string[] { return (this.names || []) as string[]; },
        roundTimes(): string[] { return (this.times || []) as string[]; },
        roundOptions(): { value: number, text: string }[] {
            return [{ value: 0, text: 'Current round' }].concat(this.roundNames.map((name, i) => ({
                value: i + 1,
                text: name
            })));
        }
    },
    watch: {
        option() {
            let roundTime = this.roundTimes[this.option - 1];
            this.value = roundTime ? new Date(roundTime).getTime() - this.time.getTime() : 0;
            this.$emit('input', this.value);
        }
    }
});
 
</script>

<style scoped lang="scss">
.admin-header {
    display: flex;
    justify-content: space-between;
    padding-bottom: var(--margin);
}

.disclaimer span {
    font-weight: bold;
    margin-right: var(--margin);
}

.header-tooltip {
    display: inline-block;
    color: var(--info);
    flex-shrink: 0;
}

.options {
    display: flex;

    select {
        height: auto;
        padding-top: 0;
        padding-bottom: 0;
        margin-right: var(--margin);
    }
}
</style>
