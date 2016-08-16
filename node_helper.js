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
        this.type = '';
        this.url = '';
        this.image = '';
        this.message = '';
        this.weather = '';
        },

  getAirportData: function(api_url) {
    this.url = api_url;

    var that = this;

    request({url: api_url, method: 'GET'}, function(error, response, body) {
        error;

        if (!error && response.statusCode == 200) {
            if (response.delay) {
                that.type = response.status.type;

                switch (that.type) {
                    case 'Airport Closure':
                        that.message = 'Airport closed due to ' + response.status.reason + ', expected reopening ' + response.status.ClosureEnd;
                        break;
                    case 'Ground Stops':
                        that.message = 'Ground stoppage due to ' + response.status.reason + ', expected end is ' +  response.status.EndTime;
                        break;
                    case 'Ground Delay':
                        that.message = 'Ground delay due to ' + response.status.reason + ', average delay is ' +  response.status.AvgDelay;
                        break;
                    default:
                        that.message = 'Delay due to ' + response.status.reason + ', delays are from ' +  response.status.MinDelay + ' to ' +  response.status.MaxDelay + ', and ' + response.status.Trend;
                        break;
                    }
            } else {
                that.type = 'Ok';
                that.message = 'No reported delays.';
                }

            that.weather = response.weather.weather + ', temp ' + response.weather.temp + ', wind ' + response.weather.weather + ', visibility ' + response.weather.visibility;

        } else if (error && response.statusCode == 502) {
            that.type = 'No Data';
            that.message = 'FAA system down.';
            that.weather = 'No weather data.';
        } else {
            that.type = 'Error';
            that.message = 'Error requesting data.';
            that.weather = 'No weather data.';
            }
        });

    this.sendSocketNotification('GOT-FAA-DATA', {'url': this.url, 'type': this.type , 'message': this.message, 'weather': this.weather});
  },


  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GET-FAA-DATA') {
      this.getAirportData(payload);
    }
  }

});
