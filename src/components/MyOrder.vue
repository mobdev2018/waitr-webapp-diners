<template>
  <h1>My Orders</h1>
</template>

<script>

// Dependencies
import lodash from 'lodash';

export default {
  name: 'MyOrder',
  components: {},
  data() {
    return {
    }
  },

  created () {
    // If the user hasn't placed an order yet, redirect him to...
    if(_.isEmpty(this.liveOrder)) {
      // ... his cart (if he has already added something to it)...
      if(this.liveCart.items.length > 0) {
        this.$router.push('/cart');
      } else {
        // ...the restaurants list (if his cart is empty)
        this.$router.push('/restaurants');
      }
    }
    // Call API for the user's live order
  },

  methods: {
  },

  computed: {
    liveCart() {
      return this.$store.getters.getLiveCart;
    },

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

</style>