/* Magic Mirror Module: MMM-FAA-Delay
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({

    start: function () {
        console.log('MMM-FAA-Delay helper started ...');
        },

  getAirportData: function(api_url) {
    var self = this;

    request({url: api_url, method: 'GET'}, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var trafficComparison = 0;
        if (JSON.parse(body).routes[0].legs[0].duration_in_traffic) {
          var commute = JSON.parse(body).routes[0].legs[0].duration_in_traffic.text;
          var noTrafficValue = JSON.parse(body).routes[0].legs[0].duration.value;
          var withTrafficValue = JSON.parse(body).routes[0].legs[0].duration_in_traffic.value;
          trafficComparison = parseInt(withTrafficValue)/parseInt(noTrafficValue);
        } else {
          var commute = JSON.parse(body).routes[0].legs[0].duration.text;
        }
        var summary = JSON.parse(body).routes[0].summary;
        self.sendSocketNotification('GOT-FAA-DATA', {'commute':commute, 'url':api_url, 'trafficComparison': trafficComparison, 'summary':summary});
      }
    });
  },


  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GET-FAA-DATA') {
      this.getAirportData(payload);
    }
  }

});
