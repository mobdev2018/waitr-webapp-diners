<template>
<nav class="navbar navbar-default navbar-fixed-bottom">
  <div class="container-fluid">
    <div v-bind:class="{'active': $route.path == '/'}" class="navbar-header">
      <router-link class="navbar-brand" to="/order">
        waitr
      </router-link>
    </div>
    <div id="navbar">
      <ul class="nav navbar-nav navbar-left">
        <li>
          <router-link to="/restaurants">Restaurants</router-link>
        </li>
      </ul>
      <ul class="nav navbar-nav navbar-right">
        <li>
          <router-link to="/cart">Cart</router-link>
        </li>
      </ul>
    </div><!--/.nav-collapse -->
  </div><!--/.container-fluid -->
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
  }

  .navbar-default .navbar-nav>.active>a, .navbar-default .navbar-nav>.active>a:focus, .navbar-default .navbar-nav>.active>a:hover {
    background-color: #262626;
  }

  a {
    color: white;
    cursor: pointer;
  }


</style>
