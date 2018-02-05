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
		restaurants: [],
		menu: {
			menuId: null,
			name: null,
			categories: []
		},
		cart: {
			// Set schema
		},
		order: {
			// Set schema
		}
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
			Restaurants
		**/

		/**
			Menu
		**/
		setMenu(state, menu) {
			state.menu = menu;
		},

		/**
			Order
		**/
		setLiveOrder(state, order) {
			state.order = order;
		},

		updateOrderStatus(state, order) {
			// Different statuses require different actions
		},

		updateTimeSinceOrderPlaced(state) {
			order.timeAgo = moment(orders[i].time).utc().fromNow();
		},

		/**
			Cart
		**/

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
			Restaurants
		**/

		/**
			Menu
		**/

		/**
			Order
		**/
		getLiveOrder(state) {
			return state.order;
		},

		/**
			Cart
		**/
	}
});