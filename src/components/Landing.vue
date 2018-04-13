<template>
  <div class="container">

    <!-- 
      *The Waitr Logo *
    -->
    <img src="../assets/logo.png">

    <!-- 
      *The Form*: the user can toggle between the signin and signup forms
      by clicking the <span> elements
    -->

    <!-- *Signup Form* (shown by default) -->
    <form id="signupForm" v-if="activeForm == 'signup'">
      <input name="firstName" placeholder="Enter your first name"/>
      <input name="lastName" placeholder="Enter your last name"/>
      <input name="email" placeholder="Enter a valid email address"/>
      <input name="password" placeholder="Enter a password"/>
      <input name="confirmPassword" placeholder="Re-enter your password"/>
      <button>Sign me in!</button>
      <p>
        Already have an account? 
        <span v-on:click="activeForm = 'signin'">
          Sign in
        </span>
      </p>
    </form>

    <!-- *Signin Form* -->
    <form id="signinForm" v-if="activeForm == 'signin'">
      <input name="email" placeholder="Enter your email address"/>
      <input name="password" placeholder="Enter your password"/>
      <button>Sign me up!</button>
      <p>
        Don't have an account? 
        <span v-on:click="activeForm = 'signup'">
          Sign up
        </span>
      </p>
    </form>

  </div>
</template>

<script>

export default {
  name: 'Landing',
  components: {},
  data() {
    return {
      activeForm: 'signin'
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

  .container {
    /** background-image: url('../assets/restaurant.jpg'); **/ 
    display: -webkit-flex;
    display: flex;
    height: 100vh;
    width: 100vw;
    background-size: cover;
    padding: 0 10px;
    margin: 0;
    position: absolute;
    top: 0;
    left: 0;
  }

  img {
    height: 200px;
    width: auto;
  }

  form {}

  #signinForm {}

  #signupForm {}

  input {}

  button {}

  p {}

  span {
    cursor: pointer;
  }

</style>