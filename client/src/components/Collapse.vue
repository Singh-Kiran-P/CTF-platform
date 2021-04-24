<template>
    <div id=Collapse>
        <label @click="visible = !visible">{{label}}</label>
        <IconButton icon="chevron-down" :class="visible ? 'danger' : 'primary'" @click="visible = !visible"/>
        <b-collapse :visible="visible">
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
        label: String
    },
    data: () => ({
        visible: false
    })
});
</script>

<style scoped lang="scss">
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
