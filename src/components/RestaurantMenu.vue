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
    <div class="container" v-else>
      <h1>{{menu.restaurantName}} - {{menu.menuName}}</h1>
      <ul>
        <li v-for="category in menu.categories">
          <h3>{{category.name}}</h3>
          <ul>
            <li v-for="item in category.items">{{item.name}}</li>
          </ul>
        </li>
      </ul>
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