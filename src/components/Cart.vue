<template>
  <div class="container">
    <nav class="navbar navbar-default navbar-fixed-top">
      <div class="container-fluid">
        <div class="row">
          <div class="col-xs-12">

            <p
            class="link"
            v-on:click="navigate"
            v-if="active.restaurantId !== null && active.menuId !== null">
              < Menu <!-- Add menu name -->
            </p>

            <p 
            class="link"
            v-on:click="navigate"
            v-else>
              < Restaurants
            </p>

          </div>
        </div>
      </div>
    </nav>
    <div class="loading" v-if="loading.still">
      <clip-loader  
        :color="loading.spinnerColor" 
        :size="loading.spinnerSize"
      >
      </clip-loader>
      <p class="loadingMsg">{{loading.msg}}</p>
    </div>

    <div v-else>
      
      <div v-if="liveCart.items.length > 0">

        <div class="jumbotron">
          <div class="container-fluid orderSummary">

            <img id="menuIcon" src="../assets/choices.png"/>

            <p id="orderTotalString">
              {{numItemsString}}
              <span id="totalPrice">£{{liveCart.totalPrice}}</span>
            </p>

            <div class="row">
              <div class="col-xs-4">
                <input 
                  id="tableNum" 
                  type="text" 
                  class="form-control input-lg" 
                  placeholder="Table no."
                  name="tableNum"
                  v-model="tableNum"
                  v-validate="{required: true, numeric: true}"
                  v-on:keyup="hasHadFocus = true"
                >
              </div>
              <div class="col-xs-8">
                <button 
                  :disabled="errors.has('tableNum') || hasHadFocus === false"
                  type="button" 
                  class="btn btn-primary btn-lg btn-block"
                  v-on:click="checkout()">
                    Go To Checkout
                </button>
              </div>
            </div>

          </div>
        </div>
        
        <div class="list-group">
          <div class="list-group-item flex-column align-items-start" v-for="item in liveCart.items">
            <div class="d-flex w-100 justify-content-between">
              <div class="row itemRow">
                <div class="col-xs-8"><p class="itemName">{{item.name}}</p></div>
                <div class="col-xs-4"><p class="itemPrice">£{{parseFloat(item.price).toFixed(2)}}</p></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="emptyCartContainer" v-else>
        <img src="../assets/circumference.png" />
        <p class="emptyCart">Your cart is empty!</p>
      </div>

    </div>

  </div>
</template>

<script>

// Dependencies
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';
import shortId from 'shortid';

// Mixins
import functions from '../mixins/functions';

export default {
  name: 'Cart',
  components: {
    'clip-loader': ClipLoader
  },
  data() {
    return {
      loading: {
        still: false,
        spinnerColor: '#006DF0',
        spinnerSize: '70px',
        msg: ''
      },
      orderStatuses: {
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
      },
      hasHadFocus: false,
      tableNum: null
    }
  },

  created () {
    this.handleNavigationChecks();
    this.handleOrderStatusUpdatesFromServer();
  },

  methods: {
    // If there is a live order (the cart should be empty), redirect the user to their order
    handleNavigationChecks() {
      if(this.liveCart.items.length < 1) {
        if(this.liveOrder.orderId && Number.isInteger(this.liveOrder.status)) {
          this.$router.push('/order/'+this.liveOrder.orderId);
        }
      }
    },

    navigate() {
      if(this.active.restaurantId !== null && this.active.menuId !== null) {
        
        this.$router.push(
          { name: 'RestaurantMenu', 
            params: {
              restaurantId: this.active.restaurantId,
              menuId: this.active.menuId
            } 
          }
        );

      } else {
        this.$router.push({ name: 'RestaurantsList' });
      }
    },

    handleOrderStatusUpdatesFromServer() {
      this.$options.sockets['orderStatusUpdated'] = (order) => {
        // Check for issues with order status
        if(order.status === undefined || !Number.isInteger(order.status)) {
          return console.log('ERR [handleOrderStatusUpdate]: order status: ' + order.status);
        }

        // Check for other required params
        if(order.orderId === undefined) {
          return console.log('ERR [handleOrderStatusUpdate]: orderId missing!');
        }

        // Update the order's status in the store
        this.$store.commit('updateOrderStatus', order);

        // If status is "recievedByKitchen", we  redirect the user to the my-order page
        if(order.status == this.orderStatuses.receivedByServer) {
          this.loading.msg = 'Your order is being sent to the restaurant! Sit tight...';
          
          // Reset the user's cart
          localStorage.removeItem('cart');
          this.$store.commit('resetCart');

          // Delay the redirection for a short time
          window.setInterval(() => {
            this.loading.msg = ''
            this.loading.still = false;
            this.$router.push({ name: 'MyOrder', params: {orderId: order.orderId} });
            return true;
          }, 2500);
        }
        // TODO: log error if error is unhandled

      }
    },

    checkout() {
      // Check that the token is set; we need this for the API call
      if(localStorage.getItem('user') === null) {
        return console.log('ERR [setRestaurantPaymentDetails]: localStorage.user not set.');
      }

      if(JSON.parse(localStorage.user).token === undefined) {
        return console.log('ERR [setRestaurantPaymentDetails]: localStorage.user.token not set.');
      }

      if(this.active.restaurantId == null) {
        return console.log('ERR [setRestaurantPaymentDetails]: active.restaurantId not set!');
      }

      // Get the restaurant's payment details
      this.$http.get('payment/restaurantDetails/' + this.active.restaurantId, {
        headers: {Authorization: JSON.parse(localStorage.user).token}
      }).then((res) => {

        if(!res.body) return console.log('ERR [setRestaurantPaymentDetails]: res.body not set!');
        if(res.body.destination == undefined || res.body.currency == undefined) {
          return console.log('ERR [setRestaurantPaymentDetails]: res.body.destination or res.body.currency missing');
        }

        // Add them to the cart
        if(localStorage.getItem('cart') === null) {
          return console.log('ERR [checkout]: localStorage.cart = null');
        }

        // Add the restaurant's payment details to the cart
        const cartObj = JSON.parse(localStorage.cart); // First convert the string to an object, then add the new item
        cartObj.destination = res.body.destination;
        cartObj.currency = res.body.currency;
        // Convert the updated cart object back to a string and save it to local storage
        const cartString = JSON.stringify(cartObj);
        localStorage.cart = cartString;
        this.$store.commit('updateCart', cartObj);
        return true;

      }).then(() => {

        // Checkout
        var customerEmail = '';
        if(localStorage.getItem('user') !== null) {
          customerEmail = JSON.parse(localStorage.user).email;
        }

        if(this.liveCart.currency == undefined || this.liveCart.totalPrice == undefined) {
          return console.log('ERR [checkout]: this.liveCart missing params.');
        }

        // this.$checkout.close() also activeRestaurantIdilable
        this.$checkout.open({
          image: require('../assets/waiter.png'),
          email: customerEmail,
          currency: this.liveCart.currency,
          amount: this.liveCart.totalPrice * 100, // in pence 
          token: (token) => {

            // Add the token to the cart (localStorage and state)
            if(localStorage.getItem('cart') === null) {
              return console.log('ERR [checkout]: localStorage.cart = null');
            }

            const cartObj = JSON.parse(localStorage.cart); // First convert the string to an object, then add the new item
            cartObj.stripeToken = token.id;
            cartObj.customerEmail = customerEmail;
            // Convert the updated cart object back to a string and save it to local storage
            const cartString = JSON.stringify(cartObj);
            localStorage.cart = cartString;
            this.$store.commit('updateCart', cartObj);
            
            // Send the order to the server (with the Stripe token for processing the payment)
            this.placeOrder();
            // Then listen for an update from the api
          } 
        });

      }).catch((err) => {
        return this.handleApiError(res);
      });
    },

    placeOrder() {
      // Check that the token is set; we need this for sending the order to the server
      if(localStorage.getItem('user') === null) return console.log('ERR [placeOrder]: localStorage.user not set.');
      if(JSON.parse(localStorage.user).token === undefined) {
        return console.log('ERR [placeOrder]: localStorage.user.token not set.');
      }

      // Check that the userId is set; we need this for sending the order to the server
      if(JSON.parse(localStorage.user).userId === undefined) {
        return console.log('ERR [placeOrder]: localStorage.user.userId not set.');
      }

      // Check that the cart state is set
      if(this.liveCart === undefined || this.liveCart === null) {
        return console.log('ERR [placeOrder]: cart state not set.');
      }

      // ACheck that all required cart-state properties are set
      const requiredCartProps = [
        'items', 'restaurantId', 'totalPrice', 'stripeToken', 'currency', 'destination', 'customerEmail'
      ];

      var missingParams = [];
      for(var i = 0; i < requiredCartProps.length; i++) {
        if(!this.liveCart.hasOwnProperty(requiredCartProps[i])) missingParams.push(requiredCartProps[i]);
      }

      if(missingParams.length > 0) {
        return console.log('ERR [placeOrder]: cart state is missing required props: ' + missingParams);
      }

      // Check that there is at least one item in the cart state
      if(this.liveCart.items.length < 1) return console.log('ERR [placeOrder]: the cart is empty!');

      // Check that the table number is an integer (should always be enforced by the input anyway)
      // if(!Number.isInteger(this.tableNum)) return console.log('ERR [placeOrder]: tableNum is not an integer!');

      const orderId = shortId.generate();

      // *TODO*: decomplicate this horrible manipulation of the order object
      // Build order object
      const order = {
        metaData: {
          orderId: orderId, // we set this here
          customerId: JSON.parse(localStorage.user).userId, // TODO: change to dinerId
          restaurantId: this.liveCart.restaurantId,
          tableNo: this.tableNum,
          price: this.liveCart.totalPrice, 
          status: this.orderStatuses.sentToServer, // we set this here
          time: new Date().getTime() // we set this here
        },
        payment: {
          orderId: orderId, 
          amount: this.liveCart.totalPrice * 100,
          currency: this.liveCart.currency,
          source: this.liveCart.stripeToken,
          destination: this.liveCart.destination,
          customerEmail: this.liveCart.customerEmail
        },
        items: this.liveCart.items
      }

      // Build order for the server, and send
      this.$socket.emit('newOrder', {
        headers: {
          token: JSON.parse(localStorage.user).token
        },
        metaData: order.metaData,
        payment: order.payment,
        items: order.items
      });

      // Build order for state, and set
      const orderState = order.metaData;
      orderState.items = order.items;
      orderState.payment = order.payment;
      this.$store.commit('setOrder', orderState);

      // Then set the spinner to sending order to server
      this.loading.msg = 'Processing your order...'
      this.loading.still = true;
    }
  },

  computed: {
    liveCart() {
      const cart = this.$store.getters.getLiveCart;
      const orderedItems = _.sortBy(cart.items, 'name');
      cart.items = orderedItems;
      return cart;
    },
    liveOrder() {
      return this.$store.getters.getLiveOrder;
    },
    active() {
      return {
        restaurantId: localStorage.getItem('activeRestaurantId'),
        menuId: localStorage.getItem('activeMenuId')
      }
    },
    numItemsString() {
      var str;
      (this.liveCart.items.length == 1) ? str = 'item' : str = 'items';
      return "Order total (" + this.liveCart.items.length + " " + str + "):";
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  @font-face {
    font-family: 'grotesque';
    src: url("../fonts/grotesque.otf");
  }

  .loading {
    position: fixed;
    top: 45% !important;
    left: 50% !important;
    transform: translate(-50%, -50%);
  }

  .loadingMsg {
    font-size: 16px;
    color: #006DF0;
  }

  img {
    height: 150px;
    width: auto;
  }

  .emptyCartContainer {
    position: fixed;
    top: 45% !important;
    left: 50% !important;
    transform: translate(-50%, -50%);
  }

  .emptyCart {
    margin-top: 15px;
    color: #1aa3ff;
    font-size: 16px;
    font-weight: bold;
  }

  .link {
    margin-top: 15px;
    padding-left: 15px;
    float: left;
    font-size: 14px;
    color: #006DF0;
    cursor: pointer;
  }

  .itemRow {
    margin-top: 10px;
    font-weight: bold;
  }

  .itemName {
    float: left;
    font-size: 16px;
  }

  .itemName {
    font-size: 16px;
  }

  .itemPrice {
    float: right;
    font-size: 16px;
  }

  .list-group {
    margin-bottom: 100px !important;
  }

  .list-group-item {
    border-left: 0 !important;
    border-right: 0 !important;
  }

  #orderTotalString {
    font-size: 16px !important;
  }

  #totalPrice {
    font-size: 20px;
    font-weight: bold;
  }

  #menuIcon {
    margin-bottom: 20px;
  }

  .jumbotron {
    margin-top: 10px !important;
    margin-bottom: 0 !important;
  }

  #tableNum {
    font-size: 15px;
  }

</style>
