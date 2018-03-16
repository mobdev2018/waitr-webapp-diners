<template>
<nav class="navbar navbar-default navbar-fixed-bottom">
  <div class="container-fluid">
    <div class="row">

      <div class="col-xs-4 navItem" v-on:click="navigate('RestaurantsList')">
        <img src="../assets/nav-icons/store-active.png" v-if="route == 'RestaurantsList'">
        <img src="../assets/nav-icons/store.png" v-else>
        <p v-bind:class="{ active: route == 'RestaurantsList' }">Restaurants</p>
      </div>

      <div class="col-xs-4 navItem" v-on:click="navigate('Cart')">
        <img src="../assets/nav-icons/cart-active.png" v-if="route == 'Cart'">
        <img src="../assets/nav-icons/cart.png" v-else>
        <p v-bind:class="{ active: route == 'Cart' }">Cart</p>
      </div>

      <div class="col-xs-4 navItem" v-on:click="navigate('MyOrderHistory')">
        <img src="../assets/nav-icons/list-active.png" v-if="route == 'MyOrderHistory'">
        <img src="../assets/nav-icons/list.png" v-else>
        <p v-bind:class="{ active: route == 'MyOrderHistory' }">Orders</p>
      </div>

    </div>
  </div>
</nav>
</template>

<script>

export default {
  name: 'Navbar',
  components: {},
  data() {
    return {
    }
  },

  created () {
  },

  methods: {
    navigate(routeName) {
      var routeParams = {};

      if(routeName == 'MyOrderHistory') {
                // Check that the token is set; we need this for the dynamic route
        if(localStorage.getItem('user') === null) {
          return console.log('ERR [navigate]: localStorage.user not set.');
        }

        if(JSON.parse(localStorage.user).userId === undefined) {
          return console.log('ERR [navigate]: localStorage.user.userId undefined.');
        }

        routeParams = {userId: JSON.parse(localStorage.user).userId};
      }

      this.$router.push({ name: routeName, params: routeParams });
      return true;
    }
  },

  computed: {
    route() {
      return this.$route.name;
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

  .active {
    color: #006DF0;
  }

  p {
    color: #6B6B6B;
  }

  .navItem {
    cursor: pointer;
  }


</style>
