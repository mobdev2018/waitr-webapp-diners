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
              Order total ({{liveCart.items.length}} items): <span id="totalPrice">£{{liveCart.totalPrice}}</span>
            </p>
            <button 
              type="button" 
              class="btn btn-primary btn-lg btn-block"
              v-on:click="placeOrder()">
                Go To Checkout
            </button>
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
      }
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

    placeOrder() {
      if(this.liveCart === undefined || this.liveCart === null) {
        return console.log('ERR [placeOrder]: cart state not set.');
      }

      if(!this.liveCart.hasOwnProperty('items')) {
        return console.log('ERR [placeOrder]: cart.items state not set.');
      }

      if(this.liveCart.items.length < 1) {
        return console.log('ERR [placeOrder]: the cart is empty!');
      }

      // Check that the token is set; we need this for sending the order to the server
      if(localStorage.getItem('user') === null) return console.log('ERR [placeOrder]: localStorage.user not set.');
      if(JSON.parse(localStorage.user).token === undefined) {
        return console.log('ERR [placeOrder]: localStorage.user.token not set.');
      }

      // Check that the userId is set; we need this for sending the order to the server
      if(JSON.parse(localStorage.user).userId === undefined) {
        return console.log('ERR [placeOrder]: localStorage.user.userId not set.');
      }

      // Build order object
      const order = {
        metaData: {
          orderId: shortId.generate(),
          // TODO: change to dinerId (update on server and in restaurant web app)
          customerId: JSON.parse(localStorage.user).userId,
          restaurantId: this.liveCart.restaurantId,
          tableNo: 8, // TODO: allow the user to provide the table number before placing the order
          price: this.liveCart.totalPrice,
          status: this.orderStatuses.sentToServer,
          time: new Date().getTime()
        },
        items: this.liveCart.items
      }

      // Send the order to the server
      this.$socket.emit('newOrder', {
        headers: {
          token: JSON.parse(localStorage.user).token
        },
        metaData: order.metaData,
        items: order.items
      });

      // Add the order to the store
      const orderState = order.metaData;
      orderState.items = order.items;
      this.$store.commit('setOrder', orderState);

      // Then set the spinner to sending order to server
      this.loading.msg = 'Processing your order...'
      this.loading.still = true;
    }
  },

  computed: {
    liveCart() {
      return this.$store.getters.getLiveCart;
    },
    liveOrder() {
      return this.$store.getters.getLiveOrder;
    },
    active() {
      return {
        restaurantId: localStorage.getItem('activeRestaurantId'),
        menuId: localStorage.getItem('activeMenuId')
      }
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

</style>
