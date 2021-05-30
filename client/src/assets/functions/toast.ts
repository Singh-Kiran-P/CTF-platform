import Vue from "vue";

const toast = {
    send(_this: Vue, title: string, message: string, type: string, append = false) {
        const element = _this.$createElement;

        // Create the message
        const vNodesMsg = element(
            'p',
            { class: ['text-break', 'mb-0'] },
            [
                element('strong'), `${message}`,
            ]
        );

        // Create the title
        const vNodesTitle = element(
            'p',
            { class: ['text-break', 'mr-2'] },
            [
                element('strong', { class: 'mr-2' }, title),
            ],
        );

        _this.$bvToast.toast([vNodesMsg], {
            title: [vNodesTitle],
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
