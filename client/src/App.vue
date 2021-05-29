<template>
    <div id=app>
        <PageBar/>
        <PushNotification  v-if="auth"/>
        <div id=page>
            <router-view :key="$route.fullPath"/>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import PageBar from '@/components/PageBar.vue';
import PushNotification from '@/components/PushNotification.vue';

export default Vue.extend({
    name: 'App',
    data: () => ({
        role: '',
    }),
    components: {
        PageBar,
        PushNotification,
    },
    mounted() {
        this.setIframeBase();
    },
    updated() {
        this.setIframeBase();
    },
    computed: {
        auth(): boolean { return this.$route.meta.auth; }
    },
    methods: {
        setIframeBase(): void { // set iframe base target to _parent, making links behave normally
            this.loaded(document.getElementById('page')?.getElementsByTagName('iframe')[0]?.contentWindow, iframe => {
                if (iframe.document.head.getElementsByTagName('base').length > 0) return;
                let base = document.createElement('base');
                base.target = '_parent';
                iframe.document.head.append(base);
            });
        },
        loaded(iframe: Window | null | undefined, func: (i: Window) => void): void {
            if (!iframe) return;
            if (iframe.document.readyState == 'complete') func(iframe);
            iframe.addEventListener('load', () => func(iframe));
        }
    },
});
</script>

<style lang="scss">
@import "@/assets/css/custom.scss";

#app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

#pageBar, #page {
    width: 100%;
}

#page {
    height: 100%;
    display: flex;
    flex-shrink: 1;
    overflow: auto;
}

#page > iframe, #page > div {
    width: 100%;
    max-width: 100%;
    min-height: 100%;
    overflow: auto;
}

#page > iframe {
    border: none;
}
</style>
