import Vue from 'vue';
import VueSocketio from 'vue-socket.io';
import settings from '../../../config/settings';
import functions from '../../mixins/functions';

export default {
  name: 'Landing',
  components: {},
  mixins: [functions],
  data() {
    return {
      activeForm: 'signin',
      forms: {
        signin: {
          email: '',
          password: ''
        },
        signup: {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: ''
        }
      }
    }
  },

  watch: {
    // Remove the flash message when the user toggles to another form
    activeForm: function() {
      this.flash().destroyAll();
    }
  },

  created () {
    // If the user is logged in, redirect them to...
    if(this.userIsAuthenticated) {
      this.$router.push('/restaurants');
    }
  },

  methods: {
    signin(autoLogin=false) {
      var email, pass;
      // If the login is automatic, upon successful registration, then we use the details from the sign up form
      if(autoLogin) {
        email = this.forms.signup.email;
        pass = this.forms.signup.password;
      } else {
        // If the login is manual (the user has used the signin form), we must validate it
        if(this.someFieldsAreEmpty(this.forms.signin)) {
          this.displayErrorMsg(
            'The username and password you entered did not match our records. Please double-check and try again.'
          );
          return;
        }
        email = this.forms.signin.email;
        pass = this.forms.signin.password;

      }

      const queryString = '?email='+email+'&password='+pass;
      this.$http.get('auth/login/d'+queryString, {
      }).then((res) => {

        if(res.status == 200 || res.status == 201) {
          // Add data to local storage
          localStorage.setItem('user', JSON.stringify(res.body.data.user));
          localStorage.setItem('isAuth', true);
          this.$store.commit('authenticateUser');
          this.connectToWebSocketsServer();
          this.$router.push('/restaurants');
        }

      }).catch((res) => {
        this.handleApiError(res);
      });
    },

    signup(scope) {
      // Check validation errors
      this.$validator.validateAll(scope).then((result) => {
        if(this.errors.any()) {
          this.displayErrorMsg(this.errors.all()[0]);
          return;
        }

        // Check for empty fields (v-validate doesn't catch this if the user doesn't give focus to the inputs)
        if(this.someFieldsAreEmpty(this.forms.signup)) {
          this.displayErrorMsg('Please fill in all the fields!');
          return;
        }

        this.$http.post('user/d', {
          firstName: this.forms.signup.firstName,
          lastName: this.forms.signup.lastName,
          email: this.forms.signup.email,
          password: this.forms.signup.password
        }).then((res) => {

          // For now just log the user in; later we will handle email verification
          this.signin(true);

        }).catch((res) => {
          this.handleApiError(res);
        });

      });
    },

    someFieldsAreEmpty(form) {
      for(var input in form) {
        const inputValMinusWhitespace = form[input].split(' ').join('');
        if(inputValMinusWhitespace == '') {
          return true;
        }
      }
      return false;
    },

    // Connect to LiveKitchen
    connectToWebSocketsServer() {
      if(localStorage.getItem('user') !== null) {
        const user = JSON.parse(localStorage.user);
        if(user.hasOwnProperty('userId')) {
          Vue.use(VueSocketio, settings.webSocketsUrl+'?customerId='+user.userId);
        }
      }
      return;
    }
  },

  computed: {
    userIsAuthenticated() {
      return this.$store.getters.isUserAuthenticated;
    }
  }
}