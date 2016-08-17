/* Magic Mirror Module: MMM-FAA-Delay helper
 * Version: 1.0.0
 * 
 * By Nigel Daniels https://github.com/nigel-daniels/
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({

    start: function () {
        console.log('MMM-FAA-Delay helper, started...');

        // Set up the local values
        this.type = '';
        this.url = '';
        this.image = '';
        this.message = '';
        this.weather = '';
        },


    getAirportData: function(payload) {
        // The payload should be the request url we want to use
        this.url = payload;

        var that = this;

        request({url: payload, method: 'GET'}, function(error, response, body) {

            // Lets convert the body into JSON
            var result = JSON.parse(body);

            // Check to see if we are error free and got an OK response
            if (!error && response.statusCode == 200) {

                // Is there a delay at the airport?
                if (result.delay  == 'true') {

                    // Figure out the type of delay and craft the response accordingly
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

                // Now let's get the weather at the airport
                that.weather = result.weather.weather + ', temp ' + result.weather.temp + ', wind ' + result.weather.wind + ', visibility ' + result.weather.visibility + '.';

            } else if (error && response.statusCode == 502) {
                // If we get an error and a 502 it's what the FAA use to indicate thier system is down.
                that.type = 'No Data';
                that.message = 'FAA system down.';
                that.weather = 'No weather data.';
            } else {
                // In all other cases it's some other error
                that.type = 'Error';
                that.message = 'Error requesting data.';
                that.weather = 'No weather data.';
                }

            // We have the response figured out so lets fire off the notifiction
            that.sendSocketNotification('GOT-FAA-DATA', {'url': that.url, 'type': that.type , 'message': that.message, 'weather': that.weather});
            });
        },


    socketNotificationReceived: function(notification, payload) {
        // Check this is for us and if it is let's get the airport info
        if (notification === 'GET-FAA-DATA') {
            this.getAirportData(payload);
            }
        }

    });
