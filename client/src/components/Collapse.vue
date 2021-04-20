<template>
    <div id=Collapse>
        <label @click="visible = !visible">{{label}}</label>
        <b-button :class="['icon', visible ? 'danger' : 'primary']" @click="visible = !visible">
            <font-awesome-icon icon=chevron-down />
        </b-button>
        <b-collapse :visible="visible">
            <slot/>
        </b-collapse>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'Collapse',
    props: {
        label: String
    },
    data: () => ({
        visible: false
    })
});
</script>

<style scoped lang="scss">
@import '@/assets/css/iconButton.scss';

label {
    display: inline;
    margin-bottom: 0;
    font-weight: bold;
}

.collapse {
    margin-top: 0 !important;
    border-bottom: 2px solid black;
}

button {
    float: right;
}

button.danger {
    transform: rotate(180deg);
}
</style>
