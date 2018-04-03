<template>
  <div class="container">

    <!-- Error -->
    <nav v-if="error.active" class="navbar">
      <div class="container-fluid">
        <div class="row">
          <p class="errorMsg col-xs-10 col-xs-offset-1">{{error.msg}}</p>
        </div>
      </div>
    </nav>
    
    <!-- Login form -->
    <div id="loginFormBox" class="formBox col-xs-10 col-xs-offset-1" v-if="loginFormIsVisible">
      <img src="../assets/waiter.png" />
      <h1 class="formType">Log in</h1>
      <form id="loginForm" v-on:keyup.enter="logUserIn()">
        <input
          class="input pass"
          type="email"
          v-bind:placeholder="form.login.email.placeholder"
          v-model="form.login.email.value"
          v-on:focus="hidePlaceholder('login', 'email')"
          v-on:blur="updateInputStatus('login', 'email')"
        />
        <input
          class="input pass"
          type="password"
          v-bind:placeholder="form.login.password.placeholder"
          v-model="form.login.password.value"
          v-on:focus="hidePlaceholder('login', 'password')"
          v-on:blur="updateInputStatus('login', 'password')"
        />
        <button
          type="button"
          class="inputButton"
          v-on:click="logUserIn()">
          Sign me in
        </button>
        <div class="text-center"">
            Don't have an account?
            <a
              class="formLink"
              v-on:click="hideLoginForm">
              Sign up
            </a>
            <!--
            -
            <a
              class="formLink">
              Forgot password
            </a>
            -->
        </div>
      </form>
    </div>

    <div id="signupFormBox" class="formBox col-xs-8 col-xs-offset-2" v-else>
      <!-- Registration form -->
      <div class="row">
        <h1 class="formType">Create an account</h1>
      </div>
      <form id="signupForm" v-on:keyup.enter="registerUser()">
        <!-- First name -->
        <input
          :class="{'input': true, 'pass' : true, 'is-danger-input': errors.has('firstName') }"
          name="firstName"
          type="text"
          v-bind:placeholder="form.signup.firstName.placeholder"
          v-model="form.signup.firstName.value"
          v-validate="{required: true, max: 100}"
          v-on:focus="hidePlaceholder('signup', 'firstName')"
          v-on:blur="updateInputStatus('signup', 'firstName')"
          data-vv-as="first name"
        />
        <span
          class="help is-danger"
          v-show="errors.has('firstName')">
          {{ errors.first('firstName') }}
        </span>

      <!-- Last name -->
        <input
          :class="{'input': true, 'pass' : true, 'is-danger-input': errors.has('lastName') }"
          name="lastName"
          type="text"
          v-bind:placeholder="form.signup.lastName.placeholder"
          v-model="form.signup.lastName.value"
          v-validate="{required: true, max: 100}"
          v-on:focus="hidePlaceholder('signup', 'lastName')"
          v-on:blur="updateInputStatus('signup', 'lastName')"
          data-vv-as="last name"
        />
        <span
          class="help is-danger"
          v-show="errors.has('lastName')">
          {{ errors.first('lastName') }}
        </span>

        <!-- Email address -->
        <input
          :class="{'input': true, 'pass' : true, 'is-danger-input': errors.has('email') }"
          name="email"
          type="email"
          v-bind:placeholder="form.signup.email.placeholder"
          v-model="form.signup.email.value"
          v-validate="{required: true, max: 150}"
          v-on:focus="hidePlaceholder('signup', 'email')"
          v-on:blur="updateInputStatus('signup', 'email')"
        />
        <span
          class="help is-danger"
          v-show="errors.has('email')">
          {{ errors.first('email') }}
        </span>
        <!-- Password -->
        <input
          :class="{'input': true, 'pass' : true, 'is-danger-input': errors.has('password') }"
          name="password"
          type="password"
          v-bind:placeholder="form.signup.password.placeholder"
          v-model="form.signup.password.value"
          v-validate="{required: true, min: 6, max: 30}"
          v-on:focus="hidePlaceholder('signup', 'password')"
          v-on:blur="updateInputStatus('signup', 'password')"
        />
        <span
          class="help is-danger"
          v-show="errors.has('password')">
          {{ errors.first('password') }}
        </span>
        <!-- Confirm Password -->
        <input
          :class="{'input': true, 'pass' : true, 'is-danger-input': errors.has('confirmPassword') && inputs.hasHadFocus.indexOf('confirmPassword') > -1}"
          name="confirmPassword"
          type="password"
          v-bind:placeholder="form.signup.confirmPassword.placeholder"
          v-model="form.signup.confirmPassword.value"
          v-validate="'confirmed:password|required'"
          v-on:focus="hidePlaceholder('signup', 'confirmPassword')"
          v-on:blur="updateInputStatus('signup', 'confirmPassword')"
          data-vv-as="confirm password"
        />
        <span
          class="help is-danger"
          v-show="errors.has('confirmPassword') && inputs.hasHadFocus.indexOf('confirmPassword') > -1">
          {{ errors.first('confirmPassword') }}
        </span>

        <div class="row formBottom">
          <!-- Registration button and links -->
          <button
            class="btn btn-primary btn-md btn-block"
            :disabled="errors.items.length > 0 || inputs.hasHadFocus.length < 5"
            v-on:click="registerUser()"
            type="button">
            Sign me up!
          </button>
          <div id="switchFormString" class="text-center">
            Already have an account?
            <a
              class="formLink"
              v-on:click="showLoginForm">
              Login
            </a>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>

// LiveKitchen connection via WebSockets
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';
import config from '../../config/config';

// Events bus
import { bus } from '../main';

// Mixins
import functions from '../mixins/functions';

export default {
  name: 'Home',
  components: {
  },
  mixins: [functions],
  data() {
    return {
      loginFormIsVisible: true,
      form: {
        login: {
          email: {
            value: '',
            placeholder: 'Email address'
          },
          password: {
            value: '',
            placeholder: 'Password'
          },
        },
        signup: {
          firstName: {
            value: '',
            placeholder: 'First name'
          },
          lastName: {
            value: '',
            placeholder: 'Last name'
          },
          email: {
            value: '',
            placeholder: 'Enter a valid email address'
          },
          password: {
            value: '',
            placeholder: 'Choose a password'
          },
          confirmPassword: {
            value: '',
            placeholder: 'Re-enter password'
          }
        }
      },
      formDefault: {
        login: {
          email: {
            value: '',
            placeholder: 'Email address'
          },
          password: {
            value: '',
            placeholder: 'Password'
          },
        },
        signup: {
          firstName: {
            value: '',
            placeholder: 'First name'
          },
          lastName: {
            value: '',
            placeholder: 'Last name'
          },
          email: {
            value: '',
            placeholder: 'Enter a valid email address'
          },
          password: {
            value: '',
            placeholder: 'Choose a password'
          },
          confirmPassword: {
            value: '',
            placeholder: 'Re-enter password'
          }
        }
      },
      inputs: {
        hasFocus: '',
        hasHadFocus: []
      },
      error: {
        active: false,
        msg: ''
      }
    }
  },

  created () {
    console.log(this.inputs.hasHadFocus.length);
    console.log(this.errors);

    // If the user is logged in, redirect them to...    
    if(this.userIsAuthenticated) {
      this.$router.push('/restaurants');
    }
  },

  methods: {
    hidePlaceholder(form, input) {
      this.form[form][input].placeholder = '';
    },
    /**
      Using V-Validate, we check beore signing a user in whether the form has any errors.
      If no input has yet been clicked, and the user clicks the submit button, no errors
      will be registered yet, and so they request will be sent to the API.
      To avoid this, we also check if any inputs have had focus; hence, we track this here.
    **/
    updateInputStatus(form, input) {
      console.log(this.errors);
      // Whenever an input loses focus, reset the placehodler to its default (because on focus, we set it to '')
      this.form[form][input].placeholder = this.formDefault[form][input].placeholder;
      // Set "focus history" of form
      if(form == 'signup') {
        this.inputs.hasFocus = input;
        this.inputs.hasHadFocus.push(input);
      }
    },

    showLoginForm() {
      // Reset the signup form
      this.form.signup = JSON.parse(JSON.stringify(this.formDefault.signup));
      this.loginFormIsVisible = true;
    },

    hideLoginForm() {
      // Reset the login form
      this.form.login = JSON.parse(JSON.stringify(this.formDefault.login));
      this.loginFormIsVisible = false;
    },

    logUserIn(isLoginAutomatic=false) {
      if(this.form.login.email.value != '' && this.form.login.password.value != '') {
        this.$http.get("auth/login/d?email="+this.form.login.email.value+"&password="+this.form.login.password.value, {
        }).then((res) => {
          if(res.status == 200 || res.status == 201) {
            // Add data to local storage
            localStorage.setItem('user', JSON.stringify(res.body.data.user));
            localStorage.setItem('isAuth', true);
            // Connect to LiveKitchen
            if(localStorage.getItem('user') !== null) {
              const user = JSON.parse(localStorage.user);
              if(user.hasOwnProperty('userId')) {
                // http://host?customerId={userId}
                // TODO: change to ?dinerId; change socketType to dinerId; change table names to socketsDiners and socketsRestaurantDiners
                Vue.use(VueSocketio, 'http://localhost:3000?customerId='+user.userId);
              }
            }
            // Reset the forms
            this.form = JSON.parse(JSON.stringify(this.formDefault));
            // Set auth state to true
            this.$store.commit('authenticateUser');

            // Redirect user to their dashboard
            if(isLoginAutomatic === true) {
              this.$router.push('/restaurants');
            } else {
              this.$router.push('/restaurants');
            }
          }
        }).catch((res) => {
          // TODO: this error message should be a separate component
          if (res.body && res.body.errorKey) {
            this.error.msg = res.body.userMsg;
          } else {
            this.error.msg = 'Oops! There was an unexpected error. Try again and if the issue persists, contact support.';
          }
          this.error.active = true;
          setTimeout(() => {
            this.error.active = false;
            this.error.msg = '';
          }, 5000);

          this.handleApiError(res);
        });
      }
    },

    registerUser() {
      // TODO: The form should not be submitted until each input has had focus
      // Validate inputs (betters: if there are errors, set the button to red/unclickable using a computed property)
      if(!this.errors.any() && this.inputs.hasHadFocus.length > 0) {
        // Make the API call
        this.$http.post('user/d', {
          firstName: this.form.signup.firstName.value,
          lastName: this.form.signup.lastName.value,
          email: this.form.signup.email.value,
          password: this.form.signup.password.value
        }).then((res) => {
          // For now just log the user in; later we will handle email verification
          this.form.login.email.value = this.form.signup.email.value;
          this.form.login.password.value = this.form.signup.password.value;

          // Reset the signup form
          this.logUserIn(true);
        }).catch((res) => {
          // TODO: this error message should be a separate component
          if (res.body && res.body.errorKey) {
            this.error.msg = res.body.userMsg;
          } else {
            this.error.msg = 'Oops! There was an unexpected error. Try again and if the issue persists, contact support.';
          }
          this.error.active = true;
          setTimeout(() => {
            this.error.active = false;
            this.error.msg = '';
          }, 5000);

          this.handleApiError(res);
        });
      }
    }
  },

  computed: {
    userIsAuthenticated() {
      return this.$store.getters.isUserAuthenticated;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  @font-face {
    font-family: grotesque;
    src: url("../fonts/grotesque.otf");
  }

  .formBottom {
    margin-top: 10px;
  }

  .help {
    color: #dd0d0d !important;
    font-size: 10px;
  }

  .is-danger-input {
    border-bottom: 2px solid #dd0d0d !important;
    margin-top: 5px !important;
    margin-bottom: 5px !important;
  }

  .is-danger-input:focus {
    border-bottom: 2px solid #dd0d0d !important;
  }

  @-webkit-keyframes autofill {
    to {
      background: none;
      color: black;
    }
  }

  input.input.pass:-webkit-autofill {
    -webkit-animation-name: autofill !important;
    -webkit-animation-fill-mode: both !important;
    -webkit-box-shadow: none !important;
  }

  h1 {
    text-align: center;
    font-size: 1.8em;
  }

  h1, input {
    font-family: "grotesque", Helvetica, sans-serif;
  }

  form {
    margin-top: 20px;
  }

  .input {
    width: 100%;
    display: block;
    margin: 0 auto 15px;
    border: none;
    background: transparent;
    border-bottom: 2px solid #fff;
    text-align: left;
    font-size: 13px;
  }

  ::-webkit-input-placeholder {
    color: black;
    text-align: left;
  }
  ::-moz-placeholder {
    color: black;
  }
  :-ms-input-placeholder {
    color: black;
  }
  :-moz-placeholder {
    color: black;
  }

  .input:focus {
    outline: none;
    border-bottom-color: #469ada !important;
  }

  .input:focus::-webkit-input-placeholder{
    color: #469ada;
  }

  .input:focus::-moz-placeholder{
    color: #469ada;
  }

  .input:focus:-ms-input-placeholder{
    color: #469ada;
  }

  .input:focus:-moz-placeholder{
    color: #469ada;
  }

  .input:hover {
    border-bottom-color: #dcdcdc;
  }

  .input:invalid {
    box-shadow: none;
  }

  .pass:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px white;
  }

  .inputButton {
    position: relative;
    width: 40%;
    height: 35px;
    display: block;
    margin: 15px auto 10px;
    color: white;
    background-color: #469ada;
    border: 1px solid #469ada;
    border-radius: 3px;
    cursor: pointer;
  }

  .inputButton:focus {
    outline: none;
  }

  .formLink {
    cursor: pointer;
  }

  .text-center {
    color: black;
  }

  .text-center a {
    color: black;
    text-decoration: underline;
  }

  img {
    height: 150px;
    width: auto;
    margin-bottom: 20px;
  }

  #switchFormString {
    padding-top: 4px;
    font-size: 11px;
  }

  .navbar {
    min-height: 40px !important;
    color: white;
    background-color: red;
  }

  .errorMsg {
    padding-top: 10px;
    font-size: 10px;
  }

</style>
