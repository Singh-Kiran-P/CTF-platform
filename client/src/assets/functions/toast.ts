import Vue from "vue";

const toast = {
    send(_this: Vue, title: string, message: string, type: string, append = false) {
        _this.$bvToast.toast(title, {
            title: message,
            toaster: "b-toaster-bottom-right",
            variant: type,
            solid: true,
            noFade: true,
            autoHideDelay:1500,
            appendToast: append
        });
    }
}

export default toast;
