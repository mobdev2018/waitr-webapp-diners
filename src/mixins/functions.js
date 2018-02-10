// Events bus
import { bus } from '../main';

export default {
	methods: {

    /**
      We will handle every API error like this, in the catch block of our promise
    **/
    handleApiError(res) {
      var msg;
      if(res.body && res.body.errorKey) {
        msg = res.body.userMsg; // The API returns a user-friendly error message

      } else {
        msg = 'Oops! The waiter system experienced an error - please try again. If the issue persists, contact our support team.';
        if(res.status && res.statusText) {
          // Save to server logs (once implemented)
          console.log(res.status + " " + res.statusText);

        } else {
          // Save to server logs (once implemented)
          console.log(res);
        }
      }
      alert('error', msg);
    }
    
	}
}