import Vue from "vue";
const toast = {
    send(_this:Vue, title: string, message: string, type: string, append = false) {
        _this.$bvToast.toast(message, {
            title: title,
            toaster: "b-toaster-bottom-right",
            variant: type,
            solid: true,
            appendToast: append,
        });
    },
}

export default toast;
