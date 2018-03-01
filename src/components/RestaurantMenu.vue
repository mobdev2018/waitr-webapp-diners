<template>
  <div class="container-fluid">
    <div class="loading" v-if="loading.still">
      <clip-loader  
        :color="loading.spinnerColor" 
        :size="loading.spinnerSize"
      >
      </clip-loader>
      <p class="loadingMsg">{{loading.msg}}</p>
    </div>
    <div class="container" v-else>
      <button class="backToRestaurants" v-on:click="backToRestaurants">
        Back to restaurants...
      </button>
      <div class="panel-group" id="accordion">
        <div v-for="category in menu.categories" class="panel panel-default">
          <div class="panel-heading categoryPanelHeader">
            <h4 class="panel-title">
              <!-- Category name -->
              <a
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
              <table class="table">
                <!-- Each item is a row (<tr>) in the table body (<tbody>). We have to pass the categories object in too, because we need the category index, which we get by using "categories.indexOf(category)" in the item component" -->
                <tbody>
                  <tr v-for="item in category.items">
                    <td class="col-xs-9">{{item.name}}</td>
                    <td class="col-xs-2">{{item.price}}</td>
                    <td class="col-xs-1">
                      <span 
                        class="glyphicon glyphicon-plus-sign"
                        v-on:click="addItemToCart(item)"  
                      ></span>
                    </td>
                  </tr>
                </tbody>
              </table>
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
        spinnerColor: '#469ada',
        spinnerSize: '70px',
        msg: 'Loading menu...'
      }
    }
  },

  created () {
    /**
      If a user has items in his cart, and then navigates to the Restaurant List, we destroy the cart object in local storage, 
      and reset its state. This is to prevent the cart from containing items from multiple menus/restaurants (!)

      Unlikely, but if a user navigates directly from one menu to another (route 'r/:restaurantId/m/:menuId')
      then destroy the existing cart
    **/
    if(localStorage.getItem('cart') !== null) {
      const cartObj = JSON.parse(localStorage.cart);
      if(cartObj.restaurantId == undefined || cartObj.menuId == undefined) {
        console.log('ERR: local storage cart has required property (restaurantId, menuId) missing!');
      } else {
        // Check if the user has navigated from one menu to another menu
        if(this.$route.params.restaurantId != cartObj.restaurantId || this.$route.params.menuId != cartObj.menuId) {
          console.log('User has navigated from one menu directly to another');
          if(localStorage.getItem('cart') !== null) {
            localStorage.removeItem('cart');
            this.$store.commit('resetCart');
          }
        }
      }
    }

    /**
      Retrieve the menu from the backend
    **/
    if(this.$route.params.menuId == undefined) {
      console.log('ERR: route param menuId could not be found; cannot make getMenu api call.');
    } else {
      this.$http.get('menu/'+this.$route.params.menuId, {
        headers: {Authorization: JSON.parse(localStorage.user).token}
      }).then((res) => {
        if(res.status == 200 || res.status == 201) {
          this.loading.still = false;
          this.menu = res.body.data;
        }
      }).catch((res) => {
        this.handleApiError(res);
      });
    }
  },

  methods: {
    addItemToCart(i) {
      // Ensure that all required item properties are provided
      if(i.itemId == undefined || i.name == undefined || i.price == undefined) {
        console.log('ERR: malformed item - required param (itemId, name, price) missing. Cannot add item to cart.');
      } else {
        // Build item object (having problems with directly using the i object ?)
        const item = {
          itemId: i.itemId,
          name: i.name,
          price: i.price 
        }
        // If the cart already exists, persist the item to local storage and update the cart state
        if(localStorage.getItem('cart') !== null) {
          // Convert the string to an object, then add the new item
          const cartObj = JSON.parse(localStorage.cart);
          cartObj.items.push(item);
          // Update total price
          var totalPrice = parseFloat(cartObj.totalPrice) + parseFloat(item.price); 
          totalPrice = totalPrice.toFixed(2);
          cartObj.totalPrice = totalPrice;
          // Conver the updated cart object back to a string and save it to local storage
          const cartString = JSON.stringify(cartObj);
          localStorage.cart = cartString;
          // Add the item to the cart state
          this.$store.commit('addItemToCart', item);
        } else {
          // If this is the first item to be added to the cart, add the entire cart 'obj' to local storage and to the store
          if(this.$route.params.restaurantId == undefined || this.$route.params.menuId == undefined) {
            console.log('ERR: route params restaurantId/menuId could not be found; cart could not be created.');
          } else {
            // If the cart is empty, add it to local storage
            const cart = {
              restaurantId: this.$route.params.restaurantId,
              menuId: this.$route.params.menuId,
              totalPrice: parseFloat(item.price).toFixed(2), 
              items: [item]
            }
            localStorage.cart = JSON.stringify(cart);
            // Add the item to the cart state
            this.$store.commit('setCart', cart);
          }
        }
      }
    },

    // Add a - icon, so we have + ({num of times this item appears in cart.items}) - 
    // - is only clickable if {num of times this item appears in cart.items} > 0
    removeItemFromCart(i) {},

    backToRestaurants() {
      localStorage.removeItem('activeMenuId');
      this.$router.push('/restaurants');
    }
  },

  computed: {
    liveCart() {
      return this.$store.getters.getLiveCart;
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

  .panel-group {
    margin-top: 20px;
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
    background-color: #151515 !important;
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

  .glyphicon {
    padding-right: 10px;
    cursor: pointer;
    font-size: 12px;
  }

  .categoryName {
    background: none;
    border: none;
    text-align: center;
  }

  .categoryName:focus {
    outline: none;
    -webkit-box-shadow: none !important;
    -moz-box-shadow: none !important;
    box-shadow: none !important;
  }

  .backToRestaurants {
    margin-top: 20px;
    font-size: 20px;
  }


</style>