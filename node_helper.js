/* Magic Mirror Module: MMM-FAA-Delay
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({

    start: function () {
        console.log('MMM-FAA-Delay helper, start, called.');
        this.type = '';
        this.url = '';
        this.image = '';
        this.message = '';
        this.weather = '';
        },

  getAirportData: function(api_url) {
    //console.log('MMM-FAA-Delay helper, getAirportData, called.');
    this.url = api_url;

    var that = this;

    request({url: api_url, method: 'GET'}, function(error, response, body) {

        var result = JSON.parse(body);

        if (!error && response.statusCode == 200) {
            if (result.delay  == 'true') {
                that.type = result.status.type;

                switch (that.type) {
                    case 'Airport Closure':
                        that.message = 'Airport closed due to ' + result.status.reason + ', expected reopening ' + result.status.closureEnd + '.';
                        break;
                    case 'Ground Stop':
                        that.message = 'Ground stoppage due to ' + result.status.reason + ', expected end is ' +  result.status.endTime + '.';
                        break;
                    case 'Ground Delay':
                        that.message = 'Ground delay due to ' + result.status.reason + ', average delay is ' +  result.status.avgDelay + '.';
                        break;
                    default:
                        that.message = 'Delay due to ' + result.status.reason + ', delays are from ' +  result.status.minDelay + ' to ' +  result.status.maxDelay + ', and ' + result.status.trend + '.';
                        break;
                    }
            } else {
                that.type = 'Ok';
                that.message = result.status.reason;
                }

            that.weather = result.weather.weather + ', temp ' + result.weather.temp + ', wind ' + result.weather.wind + ', visibility ' + result.weather.visibility + '.';

        } else if (error && response.statusCode == 502) {
            that.type = 'No Data';
            that.message = 'FAA system down.';
            that.weather = 'No weather data.';
        } else {
            that.type = 'Error';
            that.message = 'Error requesting data.';
            that.weather = 'No weather data.';
            }

        that.sendSocketNotification('GOT-FAA-DATA', {'url': that.url, 'type': that.type , 'message': that.message, 'weather': that.weather});
        });
    },


    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function(notification, payload) {
        //console.log('MMM-FAA-Delay helper, socketNotificationReceived, called.');
        if (notification === 'GET-FAA-DATA') {
            this.getAirportData(payload);
            }
        }

    });
