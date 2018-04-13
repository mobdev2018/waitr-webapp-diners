<template>
  <div class="container-fluid">

    <nav class="navbar navbar-default navbar-fixed-top">
      <div class="container-fluid">
        <div class="row">
          <div class="col-xs-12">

            <!-- Back-to-restaurants link -->
            <p
            class="link backToRestaurants"
            v-on:click="backToRestaurants"
            >
              < Restaurants
            </p>

            <!-- Cart button -->
            <button
              v-if="liveCart.items.length > 0"
              type="button"
              id="cartBtn"
              class="btn btn-primary"
              v-on:click="goToCart"
              >
              <div class="row">
                <span class="glyphicon glyphicon-shopping-cart"></span>
                <span id="cart_numItems">{{liveCart.items.length}}</span>
                <span id="cart_separator">|</span>
                <span id="cart_totalPrice">£{{liveCart.totalPrice}}</span>
              </div>
            </button>


          </div>
        </div>
      </div>
    </nav>

    <!-- Loading wheel, which is hidden once the API responds to the getMenu call -->
    <div class="loading" v-if="loading.still">
      <clip-loader
        :color="loading.spinnerColor"
        :size="loading.spinnerSize"
      >
      </clip-loader>
      <p class="loadingMsg">{{loading.msg}}</p>
    </div>

    <!-- The Restaurant's menu -->
    <div class="container" v-else>

      <div class="panel-group" id="accordion">
        <div v-for="category in menu.categories" class="panel panel-default">
          <div class="panel-heading categoryPanelHeader">
            <h4 class="panel-title">
              <!-- Category name -->
              <a
                class="categoryName"
                data-toggle="collapse"
                data-parent="#accordion"
                v-bind:href="'#' + category.categoryId"
                >{{category.name}}
              </a>
            </h4>
          </div>
          <div
            class="panel-collapse collapse"
            v-bind:class="{'in': menu.categories.indexOf(category) == 0 && menu.categories[0].items.length > 0}"
            v-bind:id="category.categoryId"
          >
            <!-- Each category is a collapsable panel, containing a table of the category's items -->
            <div class="panel-body">
              <div class="list-group">
                <div class="list-group-item flex-column align-items-start" v-for="item in category.items">
                  <div class="d-flex w-100 justify-content-between">
                    <div class="row itemRow">
                      <div class="col-xs-5"><p class="itemName">{{item.name}}</p></div>
                      <div class="col-xs-3"><p class="itemPrice">£{{parseFloat(item.price).toFixed(2)}}</p></div>
                      <div class="col-xs-4">
                        <span
                          class="glyphicon glyphicon-plus-sign"
                          v-on:click="addItemToCart(item)"
                        ></span>
                        <span
                          v-if="itemPrevalence[item.itemId] != undefined"
                          class="itemPrevalence"
                          >{{itemPrevalence[item.itemId]}}</span>
                        <span
                          v-if="itemPrevalence[item.itemId] != undefined"
                          class="glyphicon glyphicon-minus-sign"
                          v-on:click="removeItemFromCart(item)"
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>

// Dependencies
import ClipLoader from 'vue-spinner/src/ClipLoader.vue';

// Mixins
import functions from '../mixins/functions';

export default {
  name: 'RestaurantMenu',
  components: {
    'clip-loader': ClipLoader
  },
  mixins: [functions],

  data() {
    return {
      menu: {},
      loading: {
        still: true,
        spinnerColor: '#006DF0',
        spinnerSize: '70px',
        msg: 'Loading menu...'
      }
    }
  },

  created () {
    this.setActiveRestaurantAndMenu();
    /**
      If a user has items in his cart, and then navigates to the Restaurant List, we destroy the cart object in local storage,
      and reset its state. This is to prevent the cart from containing items from multiple menus/restaurants (!)

      (Later we can have multiple carts, identified by the menuId).

      The following is unlikely, but if a user navigates directly from one menu to another, e.g.

        1) User is currently on route `/r/SkxjHgNYRb/m/r1biHgNY0Z` (menu A)
        2) User enters into address bar route `/r/SkxjHgNYRb/m/xjj8sD0c9` (menu B)

      then we destroy the existing cart. Otherwise the cart may later contain items from both ymenu A AND menu B!
    **/
    this.manageCartOnNavigation();
    this.getMenuFromBackend();
  },

  methods: {
    setActiveRestaurantAndMenu() {
      // Keep state syncronised with localStorage; revise exactly why we use state as well as local storage, for cart and active menu
      /**
      if(this.$route.params.restaurantId == undefined) {
        return console.log('ERR [setActiveRestaurantAndMenu]: liveCart.restaurantId undefined!');
      }

      if(this.$route.params.menuId == undefined) {
        return console.log('ERR [setActiveRestaurantAndMenu]: liveCart.menuId undefined!');
      }
      **/

      localStorage.activeRestaurantId = this.$route.params.restaurantId;
      localStorage.activeMenuId = this.$route.params.menuId;
      return true;
    },

    manageCartOnNavigation() {
      // If cart is not set, there's nothing to destroy/reset
      if(localStorage.getItem('cart') === null) return true;

      // We need to check the restaurant and menu of the cart items, against the menu (and restaurant) the user is navigating to
      const cartObj = JSON.parse(localStorage.cart);
      /**
      if(cartObj.restaurantId == undefined || cartObj.menuId == undefined) {
        return console.log('ERR [manangeCartOnNavigation]: cart missing at least one param (restaurantId, menuId).');
        // Replace spinner with error message
      }
      **/

      // If the user has navigated directly to another menu (unlikely), destroy the current cart and reset the cart state
      if(this.$route.params.restaurantId != cartObj.restaurantId || this.$route.params.menuId != cartObj.menuId) {
        console.log('User has navigated from one menu directly to another');
        localStorage.removeItem('cart');
        this.$store.commit('resetCart');
      }
      return true;
    },

    getMenuFromBackend() {
      // Check that the token is set; we need this for the API call
      /**
      if(localStorage.getItem('user') === null) return console.log('ERR [getMenuFromBackend]: localStorage.user not set.');
      if(JSON.parse(localStorage.user).token === undefined) {
        return console.log('ERR [getMenuFromBackend]: localStorage.user.token not set.');
        // Replace spinner with error message
      }

      // Navigation to this route includes a menuId route param, e.g. `/r/SkxjHgNYRb/m/{menuId}`
      if(this.$route.params.menuId == undefined) {
        return console.log('ERR: [getMenuFromBackend] route param menuId could not be found.');
        // Replace spinner with error message
      }
      **/

      // Retrieve the menu from the API
      this.$http.get('menu/'+this.$route.params.menuId, {
        headers: {Authorization: JSON.parse(localStorage.user).token}
      }).then((res) => {

        if(res.status == 200 || res.status == 201) {
          this.loading.still = false;
          this.menu = res.body.data;
          return true;
        }
        return console.log('ERR [getMenuFromBackend]: res.status neither 200 nor 201.');
        // Replace spinner with error message

      }).catch((res) => {
        this.handleApiError(res);
      });
    },

    addItemToCart(i) {
      /**
      // Ensure that all required item properties are provided
      if(i.itemId == undefined || i.name == undefined || i.price == undefined) {
        return console.log('ERR: [addItemToCart] - required param (itemId, name, price) missing.');
        // Replace spinner with error message
      }
      **/

      // Build item object (having problems with directly using the i object ?)
      const item = {
        itemId: i.itemId,
        name: i.name,
        price: i.price
      }

      // If nothing has been added to the cart yet, create it and add the first item
      if(localStorage.getItem('cart') === null) {

        // We need to explicitly tie the items in the cart with the menu (and restaurant) to which they belong
        /**
        if(this.$route.params.restaurantId == undefined || this.$route.params.menuId == undefined) {
          return console.log('ERR: [addItemToCart] route params restaurantId/menuId could not be found.');
          // Replace spinner with error message
        }
        **/

        // Add the new cart object local storage, containing the first item
        const cart = {
          restaurantId: this.$route.params.restaurantId,
          menuId: this.$route.params.menuId,
          totalPrice: parseFloat(item.price).toFixed(2),
          items: [item]
        }

        localStorage.cart = JSON.stringify(cart); // Add the cart to localStorage
        this.$store.commit('setCart', cart); // Set the cart state (we need to sync state with localStorage, or reactivity)
        return true;
      }

      // If the cart is already set, just add the new item
      const cartObj = JSON.parse(localStorage.cart); // First convert the string to an object, then add the new item
      cartObj.items.push(item);
      // Update total price
      var totalPrice = parseFloat(cartObj.totalPrice) + parseFloat(item.price);
      totalPrice = totalPrice.toFixed(2);
      cartObj.totalPrice = totalPrice;
      // Convert the updated cart object back to a string and save it to local storage
      const cartString = JSON.stringify(cartObj);
      localStorage.cart = cartString;
      this.$store.commit('addItemToCart', item); // Add the item to the cart state
    },

    removeItemFromCart(sItem) {
      /**
      // Ensure that all required item properties are provided
      if(sItem.itemId == undefined || sItem.name == undefined || sItem.price == undefined) {
        return console.log('ERR: [removeItemFroMCart] - required param (itemId, name, price) missing.');
        // Replace spinner with error message
      }

      if(localStorage.getItem('cart') == null) {
        return console.log('ERR [removeItemFromCart]: cart missing from locaStorage.');
        // Replace spinner with error message
      }

      const cartObj = JSON.parse(localStorage.cart);
      if(!cartObj.hasOwnProperty('items')) {
        return console.log('ERR [removeItemFromCart]: cart oject from localStorage has no items array.');
        // Replace spinner with error message
      }

      if(cartObj.items.length < 1) {
        return console.log('ERR [removeItemFromCart]: cart.items array from localStorage empty.');
        // Replace spinner with error message
      }

      **/
      // First check that the cart actually contains at least one instance of this particular item
      const cartObj = JSON.parse(localStorage.cart);
      const index = cartObj.items.findIndex(i => i.itemId == sItem.itemId);

      // Remove the item from the cart
      cartObj.items.splice(index, 1);
      // Update the total price
      var totalPrice = parseFloat(cartObj.totalPrice) - parseFloat(sItem.price);
      totalPrice = totalPrice.toFixed(2);
      cartObj.totalPrice = totalPrice;

      // Conver the updated cart object back to a string and save it to local storage
      const cartString = JSON.stringify(cartObj);
      localStorage.cart = cartString;

      // Update state
      this.$store.commit('removeItemFromCart', sItem);
    },

    backToRestaurants() {
      if(localStorage.getItem('cart') !== null) {
        alert('This will reset your cart!');
      }
      localStorage.removeItem('activeRestaurantId');
      localStorage.removeItem('activeMenuId');
      this.$router.push('/restaurants');
    },

    goToCart() {
      this.$router.push('/cart');
    }

  },

  computed: {
    liveCart() {
      return this.$store.getters.getLiveCart;
    },
    itemPrevalence() {
      const items = this.liveCart.items;
      const itemPrevalence = {};
      for(var i in items) {
        if(itemPrevalence.hasOwnProperty(items[i].itemId)) {
          itemPrevalence[items[i].itemId]++;
        } else {
          itemPrevalence[items[i].itemId] = 1;
        }
      }
      return itemPrevalence;
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
    padding: 0 !important;
  }

  .container {
    padding: 0 8px !important;
  }

  .col-xs-5, .col-xs-4 {
    padding: 0 8px !important;
  }

  .panel-group {
    margin-top: 20px;
    margin-bottom: 100px !important;
  }

  .accordion {
    border: 0 !important;
    padding: 0 !important;
  }

  .panel {
    border: none !important;
  }

  .panel-body {
    padding: 0 !important;
    margin: 0 !important;
    border: 0 !important;
    border-bottom: 0 !important;
  }

  .categoryPanelHeader {
    background-color: #eee !important;
    color: #469ada !important;
    padding-right: 3px;
  }

  .panel-title {
    height: 17.6px;
  }

  table {
    border: none !important;
    margin-bottom: 0 !important;
    font-family: 'grotesque';
    color: #fff;
  }

  thead {
    background-color: #262626;
  }

  tbody {
    background-color: #3a3a3a;
  }

  .table>tbody>tr>td {
    border-top: 0;
    border-bottom: 1px solid #151515;
    text-align: left;
  }

  .name, .price {
    border-right: 1px solid #151515 !important;
  }

  .categoryName {
    font-weight: bold;
    background: none;
    border: none;
    text-align: center;
    font-size: 14px;
  }

  .categoryName:focus {
    text-decoration: none;
    outline: none;
    -webkit-box-shadow: none !important;
    -moz-box-shadow: none !important;
    box-shadow: none !important;
  }

  .backToRestaurants {
    margin-top: 20px;
    font-size: 12px !important;
  }

  .itemRow {
    margin-top: 10px;
    font-weight: bold;
    font-size: 12px !important;
  }

  .itemName {
    float: left;
    font-size: 10px !important;
  }

  .itemPrice {
    float: right;
    font-size: 10px !important;
  }

  .list-group-item {
    border-left: 0 !important;
    border-right: 0 !important;
  }

  .link {
    margin-top: 15px;
    padding-left: 8px !important;
    float: left;
    font-size: 14px !important;
    color: #006DF0;
    cursor: pointer;
  }

  #cartBtn {
    float: right;
    margin-left: 0px !important;
    margin-right: 8px !important;
    font-weight: bold;
    font-size: 12px !important;
    margin-top: 10px;
    padding-top: 3px !important;
    padding-bottom: 4px !important;
  }

  .glyphicon {
    top: 3px;
    font-size: 12px !important;
    padding-right: 3px !important;
    margin-left: 10px !important;
  }

  .glyphicon-shopping-cart {
    top: 0.25px;
  }

  .glyphicon-plus-sign, .glyphicon-minus-sign {
    padding-right: 10px !important;
    cursor: pointer;
  }

  #cart_numItems {
    margin-left: 0px;
    padding-right: 3px;
  }

  #cart_totalPrice {
    padding-left: 3px;
    margin-right: 10px;
  }

  #cart_separator {
    font-size: 15px;
  }

  .glyphicon-plus-sign, .glyphicon-minus-sign, .itemPrevalence {
    float: right;
    font-size: 0.9em;
  }

  .itemPrevalence {
    padding-left: 4px;
    padding-right: 2px;
  }

  @media (min-width: 515px) {
    .categoryName {
      font-size: 1.1em !important;
    }
    .itemName {
      font-size: 1em !important;
    }
    .itemPrice {
      font-size: 1em !important;
    }
    .glyphicon-plus-sign, .glyphicon-minus-sign, .itemPrevalence {
      font-size: 1em !important;
    }
    .backToRestaurants {
      font-size: 14px !important;
    }
    #cartBtn {
      font-size: 14px !important;
      margin-right: 15px !important;
    }
    .link {
      padding-left: 15px !important;
    }
  }

</style>
