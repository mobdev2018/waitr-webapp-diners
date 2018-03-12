<template>
  <div class="container">
    <div class="comingSoonContainer">
      <img src="../assets/hourglass.png">
      <p class="comingSoon">Coming soon...</p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'MyOrderHistory',
  components: {},
  data() {
    return {
    }
  },

  created () {
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

  .comingSoonContainer {
    position: fixed;
    top: 45% !important;
    left: 50% !important;
    transform: translate(-50%, -50%);
  }

  .comingSoon {
    margin-top: 15px;
    color: #271f59;
    font-size: 16px;
    font-weight: bold;
  }

  img {
    height: 150px;
    width: auto;
  }

</style>