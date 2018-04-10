var baseUrl = ''

if(process.env.NODE_ENV === 'production') {
   baseUrl = 'http://localhost:3000/api';
} else if(process.env.NODE_ENV === 'development') {
   baseUrl = 'http://localhost:3000/api';
}

module.exports.apiBaseUrl = baseUrl;

/**
	Config settings for VMoney; any component which uses the package should import the settings
	from here using:
	***************************
		computed: {
	    money() {
	      return config.money;
	    }
	  }

	***************************
**/
module.exports.money = {
	decimal: '.',
	thousands: ',',
	prefix: '£',
	suffix: '',
	precision: 2,
	masked: false
}

module.exports.stripeOpts = {
  key: 'pk_test_RCyQLcQj6yBVtn1fivZbVu9W', // publishable key
  name: "waitr",
  locale: 'auto',
  currency: 'GBP'
}