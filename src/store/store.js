import Vue from 'vue';
import Vuex from 'vuex';

import moment from 'moment';
import underscore from 'underscore';

Vue.use(Vuex);

const statuses = {
	sentToServer: 50,
	receivedByServer: 100,
	sentToKitchen: 200,
	receivedByKitchen: 300,
	acceptedByKitchen: 400,
	rejectedByKitchen: 999,
	enRouteToCustomer: 1000,
	// receivedByCustomer: 2000 // would be set by deliverer of food
	// returnedByCustomer: 666,
	// eaten: 500 // May be set once the user has sent feedback
};

// We must define the default state, reflecting the entire object, in order for computed properties to be reactive
export default new Vuex.Store({
	state: {
		auth: {
			isUserAuthenticated: (localStorage.isAuth == 'true')
		},
		// If the cart is set in local storage, the state should reflect it. Else, set the cart state to its default value
		cart: (localStorage.getItem('cart') !== null) ? JSON.parse(localStorage.cart) : { 
			restaurantId: '',
			menuId: '',
			totalPrice: parseFloat(0.00).toFixed(2), 
			items: [] 
		},

		// The user's live order, which is set as soon as an order is processed
		order: {}
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
		setCart(state, cart) {
			// Check that all properties are set (and that items is an array with at least one object)
			state.cart.restaurantId = cart.restaurantId;
			state.cart.menuId = cart.menuId;
			state.cart.items = cart.items;

			var totalPrice = parseFloat(state.cart.totalPrice) + parseFloat(cart.totalPrice); 
			totalPrice = totalPrice.toFixed(2);
			state.cart.totalPrice = totalPrice;
		},

		resetCart(state) {
			state.cart.restaurantId = '';
			state.cart.menuId = '';
			state.cart.totalPrice = parseFloat(0.00).toFixed(2)
			state.cart.items = [];
		},

		addItemToCart(state, item) {
			state.cart.items.push(item);
			var totalPrice = parseFloat(state.cart.totalPrice) + parseFloat(item.price); 
			totalPrice = totalPrice.toFixed(2);
			state.cart.totalPrice = totalPrice;
		},

		removeItemFromCart(state, item) {
			// Check item is actually in the cart
			const index = state.cart.items.findIndex(i => i.itemId == item.itemId);
			if(index === -1) return console.log('ERR [removeItemFromCart]: cart.items does not contain that item!');
			// Remove item from items array
			state.cart.items.splice(index, 1);
			// Update total price
			var totalPrice = parseFloat(state.cart.totalPrice) - parseFloat(item.price); 
			totalPrice = totalPrice.toFixed(2);
			state.cart.totalPrice = totalPrice;
		},

		/**
			Order
		**/
		setOrder(state, order) {
			state.order = order;
		},

		updateOrderStatus(state, order) {
			console.log('Before status update: ' + JSON.stringify(order));
			if(order.orderId === undefined || order.status === undefined) {
				return console.log('ERR [updateOrderStatus]: order.status or order.orderId undefined!');
			}

			switch(order.status) {
				case statuses.receivedByServer:
					state.order.metaData.orderId = order.orderId; // Upon receiving the order, the server assigns the orderId, then sends it back to us
					state.order.metaData.status = order.status;
					break;
				case statuses.receivedByKitchen:
				case statuses.acceptedByKitchen:
				case statuses.rejectedByKitchen:
				case statuses.enRouteToCustomer:
					state.order.metaData.status = order.status;
					break;
				default:
					console.log('Error updating order-status state. Order from server has status: ' +order.status);
					break;
			}
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
		},

		/**
			Order
		**/
		getLiveOrder(state) {
			return state.order;
		}
	}
});