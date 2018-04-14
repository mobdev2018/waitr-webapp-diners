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
    signin() {
      // Check for empty fields
      if(this.someFieldsAreEmpty(this.forms.signin)) {
        this.displayErrorMsg('Invalid login credentials. Please try again.');
      }
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
        }

        // Make the API call

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
    }
  },

  computed: {
    userIsAuthenticated() {
      return this.$store.getters.isUserAuthenticated;
    }
  }
}