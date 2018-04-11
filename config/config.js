var baseUrl = ''

if(process.env.NODE_ENV === 'production') {
   baseUrl = 'https://api.waitr.live/api';
} else if(process.env.NODE_ENV === 'development') {
   baseUrl = 'https://api.waitr.live/api';
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
