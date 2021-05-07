import Vue from 'vue';
import VueMeta from 'vue-meta';
import Vuelidate from 'vuelidate';
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import VueSweetalert2 from 'vue-sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import '@sweetalert2/theme-dark/dark.css';
import '@/assets/icons/fontAwesomeIcons';
import App from '@/App.vue';
import router from '@/router';
Vue.config.productionTip = false;
Vue.use(Vuelidate);
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(VueSweetalert2, {});
Vue.use(VueMeta, { refreshOnceOnNavigation: true });
Vue.component('font-awesome-icon', FontAwesomeIcon);

import { io } from "socket.io-client"
import VueSocketIOExt from "vue-socket.io-extended"
const socket = io("http://localhost:4000")
Vue.use(VueSocketIOExt, socket);




router.onReady = router => {
    new Vue({
        router,
        render: h => h(App)
    }).$mount('#app');
}
