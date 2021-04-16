<template>
  <div class="adminPanel">
    <span>This is the admin panel</span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "AdminPanel",
});
</script>

<style scoped>
span {
  text-align: center;
  color: var(--accentcolor) !important;
}
</style>
