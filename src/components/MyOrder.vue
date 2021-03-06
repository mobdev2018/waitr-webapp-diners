<template>
  <!-- Default loading spinner should say "Order is being sent to the restuarant" -->
  <div class="container">
    <nav class="navbar navbar-default navbar-fixed-top">
      <div class="dropdown">
        <div class="container-fluid dropdown-toggle" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
          <div class="row">
            <div class="col-xs-12">
              <p class="orderDetails">Click to see details for 
                <span style="font-weight: bold">Order {{liveOrder.orderId}}</span>
              </p>
            </div>
          </div>
        </div>
        <ul class="dropdown-menu col-xs-12" aria-labelledby="dropdownMenu1">
          <p style="font-weight: bold; text-align: center">
          {{orderRestaurantName}} | £{{parseFloat(liveOrder.price).toFixed(2)}} total</p>
          <li v-for="item in liveOrder.items">
            <a href="#" style="text-align: center">{{item.name}}, £{{parseFloat(item.price).toFixed(2)}}</a>
          </li>
        </ul>
      </div>
    </nav>

    <div class="loading" v-if="loading.still">
      <clip-loader
        :color="loading.spinnerColor"
        :size="loading.spinnerSize"
      >
      </clip-loader>
      <p
        class="loadingMsg">
        {{loading.msg}}
      </p>
    </div>

    <div class="container" v-else>

      <div v-if="liveOrder.status === 100 || liveOrder.status === 200">
        <div class="loading">
          <clip-loader  
            :color="loading.spinnerColor" 
            :size="loading.spinnerSize"
          >
          </clip-loader>
          <p 
            class="loadingMsg">
            Your order has reached the server and is being sent to the restaurant! Sit tight...
          </p>
        </div>
      </div>

      <div v-if="liveOrder.status === 300">
        <div class="loading">
          <clip-loader  
            :color="loading.spinnerColor" 
            :size="loading.spinnerSize"
          >
          </clip-loader>
          <p 
            class="loadingMsg">
            The restaurant has received your order! We'll let you know as soon as they respond.
          </p>
        </div>
      </div>

      <div v-if="liveOrder.status === 400" class="orderStatusContainer">
        <img src="../assets/confetti.png"/>
        <p class="orderStatusMsg" id="orderAccepted">Woohoo! Your order has been accepted. We'll let you know when it's on its way.</p>
      </div>

      <div v-if="liveOrder.status === 999" class="orderStatusContainer">
        <img src="../assets/upset.png"/>
        <p class="orderStatusMsg" id="orderRejected">Bad news! Your order has been rejected. A member of staff will be over to speak to you shortly.</p>
      </div>

      <!-- TODO: handle paymentRejected/orderCancelled statuses -->
      <div v-if="liveOrder.status === 1000" class="orderStatusContainer">
        <img src="../assets/startup.png"/>
        <p class="orderStatusMsg" id="orderEnRoute">Woohoo! Your order is on its way!</p>
      </div>

    </div>

  </div>
</template>

<script>

// Dependencies
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';
import lodash from 'lodash';

export default {
  name: 'MyOrder',
  components: {
    'clip-loader': ClipLoader
  },
  data() {
    return {
      loading: {
        still: true,
        spinnerColor: '#006DF0',
        spinnerSize: '70px',
        msg: 'Checking your order\'s status...'
      },

      orderStatuses: {
        acceptedByKitchen: {
          code: 400,
          msg: 'Woohoo! Your order has been accepted. We\'ll let you know when it\'s on its way.',
          iconPath: ''
        },
        rejectedByKitchen: {
          code: 999,
          msg: 'Bad news! Your order has been rejected. A member of staff will be over to speak to you shortly.',
          iconPath: ''
        },
        enRouteToCustomer: {
          code: 1000,
          msg: 'Woohoo! Your order is on it\'s way!',
          iconPath: ''
        }
      },

      orderRestaurantName: ''
    }
  },

  created () {
    // Listen for updates to the order's status
    this.handleOrderStatusUpdatesFromServer();

    // Call API for the user's live order
    this.getUsersUpToDateLiveOrderFromServer();
  },

  methods: {
    getUsersUpToDateLiveOrderFromServer() {
      /**
      // Check that the token is set; we need this for the API call
      if(localStorage.getItem('user') === null) {
        return console.log('ERR [getUsersUpToDateLiveOrderFromServer]: localStorage.user not set.');
      }

      if(JSON.parse(localStorage.user).token === undefined) {
        return console.log('ERR [getUsersUpToDateLiveOrderFromServer]: localStorage.user.token not set.');
        // Replace spinner with error message
      }

      // Navigation to this route includes an orderId route param, e.g. `/order/{orderId}`
      if(this.$route.params.orderId == undefined) {
        return console.log('ERR: [getUsersUpToDateLiveOrderFromServer] route param orderId could not be found.');
        // Replace spinner with error message
      }
      **/

      this.$http.get('order/live/'+this.$route.params.orderId, {
        headers: {Authorization: JSON.parse(localStorage.user).token}
      }).then((res) => {

        if(res.status == 200 || res.status == 201) {
          this.loading.still = false;

          if(res.body.order == undefined) {
            return console.log('ERR: [getUsersUpToDateLiveOrderFromServer] res.body.order undefined.');
          }
          this.orderRestaurantName = res.body.restaurantName;
          this.$store.commit('setOrder', res.body.order);
          return true;
        }
        return console.log('ERR [getMenuFromBackend]: res.status neither 200 nor 201.');
        // Replace spinner with error message

      }).catch((res) => {
        // Display error
        return this.handleApiError(res);
      });
    },

    handleOrderStatusUpdatesFromServer() {
      this.$options.sockets['orderStatusUpdated'] = (order) => {
        // Check for issues with order status
        /**
        if(status == undefined || !Number.isInteger(order.status)) {
          return console.log('ERR [handleOrderStatusUpdatesFromServer]: malformed order status: ' + order.status);
        }
        **/

        // Here we handle all statuses which represent a response from the restaurant (400, 999, 1000)
        for (var s in this.orderStatuses) {
         if(this.orderStatuses[s].code == order.status) {
            this.flash('The status of your order has changed!', 'success');
            this.$store.commit('updateOrderStatus', order);
            return true;
         }
        }
        // TODO: Log error if status is unhandled
      }
    }
  },

  computed: {
    liveCart() {
      return this.$store.getters.getLiveCart;
    },

    liveOrder() {
      return this.$store.getters.getLiveOrder;
    },

    orderStatusMsg() {
      const status = this.$store.getters.getLiveOrder.status;
      // Here we handle all statuses which represent a response from the restaurant (400, 999, 1000)
      for (var s in this.orderStatuses) {
       if(this.orderStatuses[s].code == status) {
          return this.orderStatuses[s].msg;
       }
      }
      // TODO: log error if status is unhandled
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
    height: 100px;
    width: auto;
  }

  .orderStatusContainer {
    position: fixed;
    top: 45% !important;
    left: 50% !important;
    transform: translate(-50%, -50%);
  }

  .orderStatusMsg {
    margin-top: 15px;
    color: #006DF0;
    font-size: 14px;
    font-weight: bold;
  }

  #orderEnRoute {
    color: #e60000 !important;
  }

  #orderAccepted {
    color: #ffa31a !important;
  }

  #orderRejected {
    color: #e68a00 !important;
  }

  .orderDetails {
    margin-top: 15px;
    padding-left: 15px;
    float: center;
    font-size: 14px;
    color: black;
    cursor: pointer;
  }

  .dropdown-menu {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  @media (min-width: 515px) {
    img {
      height: 150px;
      width: auto;
    }
    .orderStatusMsg {
      font-size: 16px;
    }
  }

</style>
