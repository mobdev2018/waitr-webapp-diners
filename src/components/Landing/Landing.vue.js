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
    signin() {
      console.log('User signed in!');
    },
    signup() {
      console.log('User signed up!');
    }
  },

  computed: {
  }
}