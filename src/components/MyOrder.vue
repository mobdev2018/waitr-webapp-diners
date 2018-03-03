<template>
  <div>
    <h1>My Orders</h1>
    <p>{{orderStatusMsg}}</p>
  </div>
</template>

<script>

// Dependencies
import lodash from 'lodash';

export default {
  name: 'MyOrder',
  components: {},
  data() {
    return {
      orderStatusMsg: '',

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
      }
    }
  },

  created () {
    // Call API for the user's live order (set the order state)

    // On refresh, we need to update the message according to the live order state (specifically the status)

    // Listen for updates to the order's status
    this.$options.sockets['orderStatusUpdated'] = (order) => {
      console.log('orderStatus myOrder: ' + order.status);
      // Here we handle all statuses which represent a response from the restaurant (400, 999, 1000)
      for (var s in this.orderStatuses) {
       console.log(s);
       if(this.orderStatuses[s].code == order.status) {
          this.orderStatusMsg = this.orderStatuses[s].msg;
          break;
       }
       // TODO: handle unexpected order status
    }
    }
  },

  methods: {
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

</style>