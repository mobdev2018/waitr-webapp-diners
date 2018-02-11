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
    if(!this.$route.params.menuId) {
      console.log('Cannot get menu: The route parameter menuId is not set!');
    } else {
      const menuId = this.$route.params.menuId;
      // We keep track of the menu the user is viewing, so that if he leaves the page, we can redirect him back to it
      localStorage.setItem('activeMenuId', menuId);
      this.$http.get('menu/'+menuId, {
        headers: {Authorization: JSON.parse(localStorage.customer).token}
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
    addItemToCart(item) {
      // Add the item to the cart state
      this.$store.commit('addItemToCart', {
        itemId: item.itemId,
        name: item.name,
        price: item.price 
      });
      // Persist the item to local storage, in case the user reloads the page
      console.log(JSON.stringify(this.liveCart));
    },

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