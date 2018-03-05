<template>
  <!-- 
    TODO: render the user's order state, with the ability to modify it as in the menu (+, -, back-to-menu) 
    If the cart is empty, just show a "Your cart is empty! Browse our restaurants so you can place an order!"
  -->
  
  <div class="container">
    <div class="loading" v-if="loading.still">
      <clip-loader  
        :color="loading.spinnerColor" 
        :size="loading.spinnerSize"
      >
      </clip-loader>
      <p class="loadingMsg">{{loading.msg}}</p>
    </div>
    <button v-on:click="placeOrder()" v-else>Place order!</button>
  </div>
</template>

<script>

// Dependencies
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';

export default {
  name: 'Cart',
  components: {
    'clip-loader': ClipLoader
  },
  data() {
    return {
      loading: {
        still: false,
        spinnerColor: '#469ada',
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
    this.handleOrderStatusUpdatesFromServer();
  },

  methods: {
    handleOrderStatusUpdatesFromServer() {
      this.$options.sockets['orderStatusUpdated'] = (order) => {
        // Check the required params are provided
        if(order.orderId === undefined || order.status === undefined) {
          return console.log('ERR [handleOrderStatusUpdate]: order.status or order.orderId undefined!');
        }

        // Update the order's status in the store
        this.$store.commit('updateOrderStatus', order);

        // If status is "receivedByServer", update the loading.msg
        if(order.status == this.orderStatuses.receivedByServer) {
          this.loading.msg = 'Your order is being sent to the restaurant! Sit tight...';
          return true;
        }

        // If status is "recievedByKitchen", we  redirect the user to the my-order page
        if(order.status == this.orderStatuses.receivedByKitchen) {
          this.loading.msg = 'Your order has been received by the restaurant. We\'ll let you know as soon as they respond.';
          // Delay the redirection for a short time
          window.setInterval(() => {
            this.loading.msg = ''
            this.loading.still = false;
            this.$router.push({ name: 'MyOrder', params: {orderId: order.orderId} });
            return true;
          }, 1500);
        }

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
      this.$store.commit('setOrder', order);

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
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%);
  }

  .loadingMsg {
    font-size: 16px;
    color: #469ada;
  }

</style>
