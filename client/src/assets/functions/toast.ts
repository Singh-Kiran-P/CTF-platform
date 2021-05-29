import Vue from "vue";

const toast = {
    send(_this: Vue, title: string, message: string, type: string, append = false) {

        // Use a shorter name for this.$createElement
        const h = _this.$createElement
        // Create the message
        const vNodesMsg = h(
            'p',
            { class: ['text-break', 'mb-0'] },
            [
                h('strong'),
                `${message} `,
            ]
        )
        // Create the title
        const vNodesTitle = h(
            'href',
            { class: ['d-flex', 'text-break', 'flex-grow-1', 'align-items-baseline', 'mr-2'] },

            [
                h('strong', { class: 'mr-2' }, title),

            ],
        )


        _this.$bvToast.toast([vNodesMsg], {
            title: [vNodesTitle],
            toaster: "b-toaster-bottom-right",
            variant: type,
            solid: true,
            autoHideDelay:1500,
            appendToast: append
        });
    },
}

export default toast;
