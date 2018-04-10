// Events bus
import { bus } from '../main';

export default {
	methods: {

    /**
      We will handle every API error like this, in the catch block of our promise
    **/
    handleApiError(res) {
      const defaultMsg = 'Oops! The waiter system experienced an error - please try again. If the issue persists, contact our support team.';
      var msg;
      if(res.body && res.body.errorKey) {
        msg = res.body.userMsg || defaultMsg; // The API returns a user-friendly error message
      } else {
        msg = defaultMsg;
        if(res.status && res.statusText) {
          // Save to server logs (once implemented)
          console.log(res.status + " " + res.statusText);

        } else {
          // Save to server logs (once implemented)
          console.log(res);
        }
      }
      // this.flash().destroyAll(); // prevent multiple errors displayed simultaneously
      this.flash(msg, 'error');
      console.log('ERROR: ' + JSON.stringify(res.body));
    }
    
	}
}