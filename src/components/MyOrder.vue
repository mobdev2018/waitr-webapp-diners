<template>
  <h1>My Orders</h1>
</template>

<script>

// Dependencies
import lodash from 'lodash';

export default {
  name: 'MyOrder',
  components: {},
  data() {
    return {
    }
  },

  created () {

    // Call API for the user's live order

    // Listen for order-status update events

  },

  methods: {
    placeOrder() {
      // Get order state
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

</style>