<template>
  <div id="app">
    <div class="container-fluid">
      <flash-message class="navbar-fixed-top"></flash-message>
      <!-- Main page content -->
      <router-view/>
      <navbar v-if="$route.path != '/'"></navbar>
    </div>
  </div>
</template>

<script>

// LiveKitchen connection via WebSockets
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';
import settings from '../config/settings';

// TODO: only connect if not already connected (also do this in app.vue and upon login, not here)
// Once the user is logged in, connect to the WebSockets server
if(localStorage.getItem('user') !== null) {
  const user = JSON.parse(localStorage.user);
  if(user.hasOwnProperty('userId')) {
    // http://host?customerId={userId}
    // TODO: change to ?dinerId; change socketType to dinerId; change table names to socketsDiners and socketsRestaurantDiners
    Vue.use(VueSocketio, settings.webSocketsUrl+'?customerId='+user.userId);
  }
}

// Global components
import Banner from './components/Banner';
import Navbar from './components/Navbar';

export default {
  name: 'app',
  components: {
      'banner': Banner,
      'navbar': Navbar
  },

  created() {
    if(!this.userIsAuthenticated) {
      // If the user is not logged in, redirect them to the home page when they visit any other page
      if(this.$route.path != '/') {
          this.$router.push('/');
      }
    }
  },

  computed: {
    userIsAuthenticated() {
      return this.$store.getters.isUserAuthenticated;
    }
  },

  // Remove flash message from UI when route changes
  watch: {
    '$route' (to, from) {
      this.flash().destroyAll();
    }
  }
}
</script>

<style>

  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    /*color: #2c3e50;*/
    margin-top: 50px;
  }

  @font-face {
    font-family: 'grotesque';
    src: url("./fonts/grotesque.otf");
  }

  .container-fluid {
    padding: 0;
  }

  /**
    Prevent overlap of flash message
  **/
  body { 
    padding-top: 50px; 
  }

  @media (min-width: 515px) {
    .container-fluid {
      padding: 20px 0px 0px 0px;
    }
  }

  .flash__message.error{
    background-color: #e60000 !important;
    border-color: #e60000 !important;
    color: white !important;
    font-size: 12px !important;
  }

</style>
