<template>
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
      order: {
        headers: {
          token: ''
        },
        metaData: {
          customerId: '',
          restaurantId: '',
          tableNo: 10,
          price: '',
          time: new Date().getTime()
        },
        items: []
      },
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
    // 1) Render a page which shows the breakdown of the user's order, with the ability to add/remove items and go back to the menu

    // 2) Let the user specify their table number

    // 3) THEN SEND THE REAL ORDER (and on the server, check each order exists in the database, check for discrepancies etc.)

    this.$options.sockets['orderStatusUpdated'] = (order) => {
      // this.$store.commit('updateOrderStatus', order);
      // this.showAlert('success', this.successMsg[order.status]);
      // Stop the spinner

      // If status is "receivedByServer", update the loading.msg
      if(order.status == this.orderStatuses.receivedByServer) {
        console.log('received by server: ' + order.status);
        this.loading.msg = 'Your order is being sent to the restaurant! Sit tight...';

      } else if(order.status == this.orderStatuses.receivedByKitchen) {
        console.log('received by server: ' + order.status);
        this.loading.msg = 'Your order has been received by the restaurant. We\'ll let you know as soon as they respond.';
        // Once the restaurant has received the order, redirect user to myorder page
        this.loading.msg = ''
        this.loading.still = false;
        this.$router.push({ name: 'MyOrder', params: {orderId: 'x9Sjd7s'} });
      }
    }
  },

  methods: {
    placeOrder() {
      // First check if the cart has any items
      if(this.liveCart.items.length < 1) {
        console.log('Err: the cart is empty! You can\'t place an empty order!');
      } else {
        // TODO: Get cart state (order items)
        // TODO: Compile the order here, by adding it to the state

        // Mock order
        const items = [
          //{
          //  itemId: 'asdasd3',
          //  name: 'Fish and Chips',
          //  price: 8.50
          //},
          {
            itemId: 'ByukFl6Rb',
            name: 'Serloin steak',
            price: 11.00
          },
          {
            itemId: 'HyjJvthAW',
            name: 'Prawn cocktail',
            price: 4.50
          },
          //{
          //  itemId: 'Hy0gdK2R-',
          //  name: '6 chicken wings',
          //  price: 5.00
          //}
        ];
        console.log(this.liveCart)
        this.$socket.emit('newOrder', {
          headers: {
            token: JSON.parse(localStorage.user).token
          },
          metaData: {
            // TODO: change to dinerId (update on server and in restaurant web app)
            customerId: JSON.parse(localStorage.user).userId,
            restaurantId: this.liveCart.restaurantId,
            tableNo: 8,
            price: this.liveCart.totalPrice,
            time: new Date().getTime()
          },
          items: items // this.liveCart.items
        });

        // Then set the spinner to sending order to server
        this.loading.msg = 'Processing your order...'
        this.loading.still = true;
      }
    }
  },

  computed: {
    liveCart() {
      return this.$store.getters.getLiveCart;
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
