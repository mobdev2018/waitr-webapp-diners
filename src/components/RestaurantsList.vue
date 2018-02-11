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
    <ul v-else>
      <!-- Each li should, upon click, show a dropdown menu of the restaurant's menus.
           For now, on click, we will automatically redirect the user to the
           restaurant's default menu (since we do not yet support multiple menus per restuarant)
      -->
      <li v-for="restaurant in restaurants">
        <router-link :to="{ 
          name: 'RestaurantMenu', 
          params: { menuId: restaurant.menus[0].menuId } 
        }">
          {{restaurant.name}} ({{restaurant.menus[0].name}})
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>

// LiveKitchen connection via WebSockets
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';
import config from '../../config/config';

// Dependencies
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';

// Mixins
import functions from '../mixins/functions';

export default {
  name: 'RestaurantsList',
  components: {
    'clip-loader': ClipLoader
  },
  mixins: [functions],
  
  data() {
    return {
      restaurants: [],
      loading: {
        still: true,
        spinnerColor: '#469ada',
        spinnerSize: '70px',
        msg: 'Loading restaurants...'
      }
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

    // This helps us to keep track of which menu the user last viewed (is ordering from)
    if(localStorage.getItem('activeMenuId') !== null) {
      // User was viewing a menu, navigated away from it, then revisits restaurants list: redirect to the menu
      const activeMenuId = localStorage.getItem('activeMenuId');
      this.$router.push('/menu/'+activeMenuId);
    }

    // Get the list of restaurants
    this.$http.get('restaurant/', {
      headers: {Authorization: JSON.parse(localStorage.customer).token}
    }).then((res) => {
      if(res.status == 200 || res.status == 201) {
        this.loading.still = false;
        this.restaurants = res.body.data;
      }
    }).catch((res) => {
      this.handleApiError(res);
    });
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