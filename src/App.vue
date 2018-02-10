<template>
  <div id="app">
    <banner></banner>
    <div class="container">
      <!-- Main page content -->
      <router-view/>
    </div>
  </div>
</template>

<script>

// LiveKitchen connection via WebSockets
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';
import config from '../config/config';

// Global components
import Banner from './components/Banner';

export default {
  name: 'app',
  components: {
      'banner': Banner
  },

  created() {
    if(!this.userIsAuthenticated) {
      // If the user is not logged in, redirect them to the home page when they visit any other page
      if(this.$route.path != '/') {
        this.$router.push('/');
      }
    }

    // Once the user is logged in, connect to the WebSockets server
    if(this.$route.path != '/') {
      if(localStorage.getItem('customer') !== null) {
        const customer = JSON.parse(localStorage.customer);
        if(customer.hasOwnProperty('userId')) {
          // http://host?restaurantId={restaurantId}
          Vue.use(VueSocketio, 'http://localhost:3000?customerId='+customer.userId);
        }
      }
    }
  },

  computed: {
    userIsAuthenticated() {
      return this.$store.getters.isUserAuthenticated;
    }
  }
}
</script>

<style>

  #app {
    font-family: Helvetica, 'Avenir', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    /*color: #2c3e50;*/
    margin-top: 50px;
  }

  .container-fluid {
    padding: 0 !important;
  }

</style>
