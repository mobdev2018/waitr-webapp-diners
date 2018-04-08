// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store/store';
import vueResource from 'vue-resource';
import VeeValidate from 'vee-validate';
import money from 'v-money'
import config from '../config/config';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';
import VueStripeCheckout from 'vue-stripe-checkout';
import VueFlashMessage from 'vue-flash-message';
 
// base/global options
// these options can be overridden 
// by the options in the .open(options) 
// function.
const options = {
  key: 'pk_test_RCyQLcQj6yBVtn1fivZbVu9W', // publishable key
  name: "waitr",
  locale: 'auto',
  currency: 'GBP'
}
 
Vue.use(VueStripeCheckout, options);

Raven
.config('https://99c74c7fc24f4dd68777c346ed28f946@sentry.io/692049')
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
Vue.http.options.root = config.apiBaseUrl;


Vue.use(VeeValidate);
Vue.use(money, {precision: 2});

Vue.use(VueFlashMessage);
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