<template>
<nav class="navbar navbar-default navbar-fixed-top">
  <div class="container-fluid">
    <div class="navbar-header">
      <p class="navbar-brand">waitr</p>
    </div>
  </div>
</nav>
</template>

<script>

export default {
  name: 'Banner',
  components: {},
  data() {
    return {
    }
  },

  created () {},

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

  #navbar {
    background-color: #3a3a3a;
    /*padding: 0 15px;*/
    font-family: 'grotesque';
  }

  #navbar .navbar-nav li a {
    color: #fff !important;
    font-size: 16px;
  }

  .navbar-header {
    padding-left: 15px;
    background-color: #3a3a3a;
  }

  .navbar-right {
    padding-right: 15px;
  }

  .navbar-right a {
    font-size: 12px !important;
  }

  .navbar {
    border: none;
    border-bottom: 4px solid #469ada;
  }

  .navbar-default .navbar-nav>.active>a, .navbar-default .navbar-nav>.active>a:focus, .navbar-default .navbar-nav>.active>a:hover {
    background-color: #262626;
  }

  a {
    color: white;
    cursor: pointer;
  }

  .navbar-brand {
    color: #469ada;
    float: none;
    font-size: 30px;    
  }

  .navbar-header {
    float: left;
    text-align: center;
    width: 100%;
  }

</style>