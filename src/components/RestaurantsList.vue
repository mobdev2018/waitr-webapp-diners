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

      <!-- Each li should, upon click, show a dropdown menu of the restaurant's menus.
           For now, on click, we will automatically redirect the user to the
           restaurant's default menu (since we do not yet support multiple menus per restuarant)
      -->
    <div class="list-group" v-else>
      <div class="list-group-item flex-column align-items-start" v-for="restaurant in restaurants">
        <div
          class="d-flex w-100 justify-content-between"
          v-on:click="navigateToMenu(restaurant.restaurantId, restaurant.menus[0].menuId)"
        >
        <div class="row">
          <div class="col-xs-12 col-sm-6">
            <p class="restaurantName">{{restaurant.name}}</p>
          </div>
          <div class="col-xs-6">
            <p class="restaurantType"></p>
          </div>
        </div>
        <div class="row">
          <div class="col-xs-8">
            <p class="restaurantTown">Canterbury</p>
          </div>
        </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>

// LiveKitchen connection via WebSockets
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';

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
        spinnerColor: '#006DF0',
        spinnerSize: '70px',
        msg: 'Loading restaurants...'
      }
    }
  },

  created () {
    this.redirectToMenu();

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
    redirectToMenu() {
      // If the user has visited a menu in this "session", then redirect them to the menu they most recently visited
      // No need to reset the cart; it will contain items from said menu
      if(this.active.restaurantId !== null && this.active.menuId !== null) {
        this.$router.push(
          { name: 'RestaurantMenu',
            params: {
              restaurantId: this.active.restaurantId,
              menuId: this.active.menuId
            }
          }
        );
      } else {
        // Otherwise, just show the restaurants list (no redirection); first check...
        // ...If the user has items in his cart, remove the cart completely
        if(localStorage.getItem('cart') !== null) {
          localStorage.removeItem('cart');
          this.$store.commit('resetCart');
        }
      }
    },

    navigateToMenu(restaurantId, menuId) {
      this.$router.push( { name: 'RestaurantMenu', params: { restaurantId, menuId } });
    }
  },

  computed: {
    liveOrder() {
      return this.$store.getters.getLiveOrder;
    },
    active() {
      return {
        restaurantId: localStorage.getItem('activeRestaurantId'),
        menuId: localStorage.getItem('activeMenuId')
      }
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

  .container-fluid {
    padding: 0;
  }

  .container {
    padding: 0 10px;
  }

  .list-group {
    margin-bottom: 100px !important;
  }

  .list-group-item {
    border-left: 0 !important;
    border-right: 0 !important;
    cursor: pointer;
  }

  .restaurantName {
    font-weight: bold;
    float: left;
    font-size: 14px;
  }

  .restaurantTown {
    float: left;
    font-size: 12px;
  }
  /* Media queries */

  @media (min-width: 450px) {
    .restaurantName {
      font-size: 16px;
    }
    .restaurantTown {
      font-size: 14px;
    }
  }

  @media (min-width: 600px) {
    .container-fluid {
      padding: 0 15px;
    }
    .container {
      padding: 0 15px;
    }
  }


</style>
