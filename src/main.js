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
 
// base/global options
// these options can be overridden 
// by the options in the .open(options) 
// function.
const options = {
  key: 'pk_live_sQmmS5iwUEyMNL1c5CLCyMz5', // publishable key
  name: "Shut up 'n' take my money!",
  locale: 'auto',
  currency: 'GBP'
}
 
Vue.use(VueStripeCheckout, options);

Raven
.config('https://99c74c7fc24f4dd68777c346ed28f946@sentry.io/692049')
.addPlugin(RavenVue, Vue)
.install();

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