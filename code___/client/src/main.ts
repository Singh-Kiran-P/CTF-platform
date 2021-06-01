import Vue from 'vue';
import VueMeta from 'vue-meta';
import Vuelidate from 'vuelidate';
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueSocketIOExt from "vue-socket.io-extended";
import VueSweetalert2 from 'vue-sweetalert2';
import '@sweetalert2/theme-dark/dark.css';
import '@/assets/icons/fontAwesomeIcons';
import { io } from "socket.io-client";
import * as dotenv from 'dotenv';
import router from '@/router';
import App from '@/App.vue';
dotenv.config();

Vue.config.productionTip = false;
Vue.use(Vuelidate);
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(VueSweetalert2, {});
Vue.use(VueMeta, { refreshOnceOnNavigation: true });
Vue.component('font-awesome-icon', FontAwesomeIcon);

let url = new URL(window.location.href).host
let hostURL = `http://${url}:${process.env.VUE_APP_API_PORT}`;

Vue.use(VueSocketIOExt, io(hostURL));

router.onReady = router => {
    new Vue({
        router,
        render: h => h(App)
    }).$mount('#app');
}
