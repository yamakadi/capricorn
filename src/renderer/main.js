import Vue from 'vue';
import axios from 'axios';

import App from './App';
import router from './router';
import store from './store';

import humanize from 'humanize'
import moment from 'moment'

import jquery from 'jquery'

if (window.$ === undefined || window.jQuery === undefined) {
    window.$ = window.jQuery = jquery;
}

require('bootstrap/dist/js/npm');

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;

Vue.humanize = Vue.prototype.$humanize = humanize;
Vue.moment = Vue.prototype.$moment = moment;

/* eslint-disable no-new */
const app = new Vue({
    components: {App},
    router,
    store,
    template: '<App/>'
}).$mount('#app');

window.app = app;