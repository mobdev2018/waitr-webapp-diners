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
          params: { restaurantId: restaurant.restaurantId, menuId: restaurant.menus[0].menuId } 
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
import lodash from 'lodash';

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
    // TODO: only connect if not already connected (also do this in app.vue and upon login, not here)
    // Once the user is logged in, connect to the WebSockets server
    if(localStorage.getItem('user') !== null) {
      const user = JSON.parse(localStorage.user);
      if(user.hasOwnProperty('userId')) {
        // http://host?customerId={userId}
        // TODO: change to ?dinerId; change socketType to dinerId; change table names to socketsDiners and socketsRestaurantDiners
        Vue.use(VueSocketio, 'http://localhost:3000?customerId='+user.userId);
      }
    }

    // If the user has items in his cart, remove the cart completely if he vists the restaurants list
    if(localStorage.getItem('cart') !== null) {
      localStorage.removeItem('cart');
      this.$store.commit('resetCart');
    }

    // Get the list of restaurants
    this.$http.get('restaurant', {
      headers: {Authorization: JSON.parse(localStorage.user).token}
    }).then((res) => {
      console.log(res);
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