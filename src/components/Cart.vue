<template>
  <button v-on:click="placeOrder()">Place order!</button>
</template>

<script>

export default {
  name: 'Cart',
  components: {},
  data() {
    return {
      order: {
        headers: {
          token: ''
        },
        metaData: {
          customerId: '',
          restaurantId: '',
          tableNo: 10,
          price: '',
          time: new Date().getTime()
        },
        items: []
      }
    }
  },

  created () {
    // 1) Render a page which shows the breakdown of the user's order, with the ability to add/remove items and go back to the menu
    // we can go back to the menu directly by getting this.liveCart.restaurantId and this.liveCart.menuId
    // There should also be a Place Order button 

    // 2) Send the order, after being able to modify it, to the API (just sent the mock order for now);
    // 3) Let the user specify their table number

    // THEN SEND THE REAL ORDER (and on the server, check each order exists in the database, check for discrepancies etc.)

    // 4) Start the spinner wheel as soon as the order is sent, and wait for a receipt confirmation from the server
    // 5) Upon receiving the confirmation, update the status of the order state, and redirect the user to the order page

    // 6) On the order page, we just need to: a) listen for order-status updates; b) make an on-load call to the API for the 
    // up-to-date state of the order (mainly we are interested in the status
  },

  methods: {
    placeOrder() {
      // TODO: Get cart state (order items)
      // TODO: Compile the order here, by adding it to the state

      // Get restaurantId
      if(localStorage.getItem('activeRestaurantId') === null) {
        console.log('Cannot get restaurant: The route parameter restaurantId is not set!');
      }

      // Mock order
      const items = [
        //{
        //  itemId: 'asdasd3',
        //  name: 'Fish and Chips',
        //  price: 8.50
        //},
        {
          itemId: 'ByukFl6Rb',
          name: 'Serloin steak',
          price: 11.00
        },
        {
          itemId: 'HyjJvthAW',
          name: 'Prawn cocktail',
          price: 4.50
        },
        //{
        //  itemId: 'Hy0gdK2R-',
        //  name: '6 chicken wings',
        //  price: 5.00
        //}
      ];

      this.$socket.emit('newOrder', {
        headers: {
          token: JSON.parse(localStorage.user).token
        },
        metaData: {
          // TODO: change to dinerId (update on server and in restaurant web app)
          customerId: JSON.parse(localStorage.user).userId,
          restaurantId: this.liveCart.restaurantId,
          tableNo: 8,
          price: this.liveCart.totalPrice,
          time: new Date().getTime()
        },
        items: items // this.liveCart.items
      });
      // Then set the spinner to sending order to server

      // Outside this function, listen for orderStatusUpdates. Once received, set the orderid an status in store
      // and redirect the user to the myorder page once the orderId and status is returned
      // const orderId = 'x9Sjd7s';
      this.$router.push({ name: 'MyOrder', params: {orderId: 'x9Sjd7s'} });
    }
  },

  computed: {
    liveCart() {
      return this.$store.getters.getLiveCart;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  @font-face {
    font-family: 'grotesque';
    src: url("../fonts/grotesque.otf");
  }

</style>
