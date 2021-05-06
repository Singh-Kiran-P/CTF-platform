import Vue from 'vue';
import VueMeta from 'vue-meta';
import Vuelidate from 'vuelidate';
import BootstrapVue from 'bootstrap-vue';
import VueSweetalert2 from 'vue-sweetalert2';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTrash, faPlus, faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import '@sweetalert2/theme-dark/dark.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

Vue.use(Vuelidate);
Vue.use(BootstrapVue);
Vue.use(VueSweetalert2, {});
Vue.use(VueMeta, { refreshOnceOnNavigation: true });

library.add(faTrash, faPlus, faCheckSquare, faSquare);
Vue.component('font-awesome-icon', FontAwesomeIcon);

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
