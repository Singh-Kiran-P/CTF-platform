<template>
    <div></div>
</template>
<script lang="ts">
import Vue from "vue";
import Toast from "../assets/functions/toast";

export default Vue.extend({
    name: "PushNotification",
    data: () => ({
        isConnected: false,
    }),
    created() {
        this.$socket.$subscribe("notification", (data: any) => {
            Toast.send(
                this,
                data.title,
                data.msg,
                "success"
            );
        });
    },
});
</script>
