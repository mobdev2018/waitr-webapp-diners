import Vue from 'vue';
import Vuex from 'vuex';

import moment from 'moment';
import underscore from 'underscore';

Vue.use(Vuex);

const statuses = {
	receivedByServer: 100,
	sentToKitchen: 200,
	receivedByKitchen: 300,
	acceptedByKitchen: 400,
	rejectedByKitchen: 999,
	enRouteToCustomer: 1000,
	// returnedByCustomer: 666,
	// eaten: 500 // May be set once the user has sent feedback
};

// We must define the default state, reflecting the entire object, in order for computed properties to be reactive
export default new Vuex.Store({
	state: {
		auth: {
			isUserAuthenticated: (localStorage.isAuth == true || localStorage.isAuth == 'true')
		},
		cart: (localStorage.cart) || { totalPrice: 0.00, items: [] }
	},
	mutations: {
		/**
			Auth
		**/
		authenticateUser(state) {
			state.auth.isUserAuthenticated = true;
		},
		deauthenticateUser(state) {
			state.auth.isUserAuthenticated = false;
		},

		/**
			Cart
		**/
		addItemToCart(state, item) {
			state.cart.items.push(item);
			var totalPrice = parseFloat(state.cart.totalPrice) + parseFloat(item.price); 
			totalPrice = totalPrice.toFixed(2);
			state.cart.totalPrice = totalPrice;
		},

		removeItemFromCart(state, item) {
			var index = state.cart.items.indexOf(item);
			if (index === -1) {
				console.log('Error removing item from cart: item could not be found in cart.');
			} else {
				array.splice(index, 1);
			}
			var totalPrice = parseFloat(state.cart.totalPrice) - parseFloat(item.price); 
			totalPrice = totalPrice.toFixed(2);
		}
	},
	actions: {},
	getters: {
		/**
			Auth
		**/
		isUserAuthenticated(state) {
			return state.auth.isUserAuthenticated;
		},

		/**
			Cart
		**/
		getLiveCart(state) {
			return state.cart;
		}
	}
});