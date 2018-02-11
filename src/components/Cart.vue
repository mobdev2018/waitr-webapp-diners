<template>
</template>

<script>

export default {
  name: 'Cart',
  components: {},
  data() {
    return {
    }
  },

  created () {
    console.log(JSON.stringify(this.liveCart));
    // If the cart is empty, redirect the user to the restaurants list
    if(this.liveCart.items.length < 1) {
      this.$router.push('/restaurants');
    }
  },

  methods: {
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

</style>
