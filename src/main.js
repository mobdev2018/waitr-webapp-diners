// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store/store';
import vueResource from 'vue-resource';
import VeeValidate from 'vee-validate';
import money from 'v-money'
import settings from '../config/settings';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';
import VueStripeCheckout from 'vue-stripe-checkout';
import VueFlashMessage from 'vue-flash-message';
 
// base/global options
// these options can be overridden 
// by the options in the .open(options) 
// function.
 
Vue.use(VueStripeCheckout, {
  key: settings.stripePubKey,
  name: "waitr",
  locale: 'auto',
  currency: 'GBP'
});

Raven
.config(settings.sentryUrl)
.addPlugin(RavenVue, Vue)
.install();

// TODO: set this also upon successful login
if(localStorage.getItem('user') !== null) {
	Raven.setUserContext({
		userId: JSON.parse(localStorage.user).userId || null,
    email: JSON.parse(localStorage.user).email || null,
	});
}

Vue.use(vueResource);
Vue.http.options.root = settings.apiBaseUrl;


Vue.use(VeeValidate);
Vue.use(money, {precision: 2});

Vue.use(VueFlashMessage, {
  messageOptions: {
    timeout: 5000,
    important: true
  }
});
require('vue-flash-message/dist/vue-flash-message.min.css');

// Use Bootstrap across the application
import jQuery from 'jquery';
global.jQuery = jQuery;
let Bootstrap = require('bootstrap');
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.config.productionTip = false;

export const bus = new Vue();

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
});