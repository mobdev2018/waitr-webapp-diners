import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import RestaurantsList from '@/components/RestaurantsList'
import RestaurantMenu from '@/components/RestaurantMenu'
import Cart from '@/components/Cart'
import MyOrder from '@/components/MyOrder'
import MyOrderHistory from '@/components/MyOrderHistory'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    // The home page for login/registration
  	{
  		path: '/',
  		name: 'Home',
  		component: Home
  	},

    // For now, upon successful login, we will send the user to the list of restaurants
    {
      path: '/restaurants',
      name: 'RestaurantsList',
      component: RestaurantsList
    },

    // For now, we will auto-redirect users from /restaurants to /menu
    // This will show the menu of the first trial restaurant. **Dynamic route required**
    {
      path: '/r/:restaurantId/m/:menuId',
      name: 'RestaurantMenu',
      component: RestaurantMenu
    },

    // Here we will execute checkout, and send the order via WebSockets
    {
      path: '/cart',
      name: 'Cart',
      component: Cart
    },

    // Once checkout is complete and the order is sent, the user will
    // be redirected to this screen, which will show the order status in 
    // real time. **Dynamic route required**
    {
      path: '/order/:orderId',
      name: 'MyOrder',
      component: MyOrder
    },

    // A screen which displays all the user's past orders
    {
      path: '/u/:userId/orders',
      name: 'MyOrderHistory',
      component: MyOrderHistory
    }
  ]
})
