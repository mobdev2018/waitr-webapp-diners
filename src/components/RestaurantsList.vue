<template>
</template>

<script>

// LiveKitchen connection via WebSockets
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';
import config from '../../config/config';

export default {
  name: 'RestaurantsList',
  components: {},
  data() {
    return {
    }
  },

  created () {
    // Once the user is logged in, connect to the WebSockets server
    if(localStorage.getItem('customer') !== null) {
      const customer = JSON.parse(localStorage.customer);
      if(customer.hasOwnProperty('userId')) {
        // http://host?customerId={customerId}
        Vue.use(VueSocketio, 'http://localhost:3000?customerId='+customer.userId);
      }
    }
  },

  methods: {
  },

  computed: {
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