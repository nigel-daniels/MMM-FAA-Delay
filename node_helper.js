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
        this.urls = [];
        this.results = [];
        },


    getAirportData: function(payload) {
        // The payload should be the request url we want to use
        this.urls = payload;
        this.results = [];
        this.count = 0;

        var that = this;
        
        for (var i = 0; i < this.urls.length; i++)
            {
            this.code = this;
            request({url: this.urls[i].url, method: 'GET'}, function(error, response, body) {
                // Lets convert the body into JSON
                var result = JSON.parse(body);
                var faaResult = {
                            code:       that.urls[that.count].code,
                            type:       '',
                            message:    '',
                            weather:    ''
                            };

                // Check to see if we are error free and got an OK response
                if (!error && response.statusCode == 200) {

                    // Is there a delay at the airport?
                    if (result.delay  == 'true') {

                        // Figure out the type of delay and craft the response accordingly
                        faaResult.type = result.status.type;

                        switch (faaResult.type) {
                            case 'Airport Closure':
                                faaResult.message = 'Airport closed due to ' + result.status.reason + ', expected reopening ' + result.status.closureEnd + '.';
                                break;
                            case 'Ground Stop':
                                faaResult.message = 'Ground stoppage due to ' + result.status.reason + ', expected end is ' +  result.status.endTime + '.';
                                break;
                            case 'Ground Delay':
                                faaResult.message = 'Ground delay due to ' + result.status.reason + ', average delay is ' +  result.status.avgDelay + '.';
                                break;
                            default:
                                faaResult.message = 'Delay due to ' + result.status.reason + ', delays are from ' +  result.status.minDelay + ' to ' +  result.status.maxDelay + ', and ' + result.status.trend + '.';
                                break;
                            }
                    } else {
                        faaResult.type = 'Ok';
                        faaResult.message = result.status.reason;
                        }

                    // Now let's get the weather at the airport
                    faaResult.weather = result.weather.weather + ', temp ' + result.weather.temp + ', wind ' + result.weather.wind + ', visibility ' + result.weather.visibility + '.';

                } else if (error && response.statusCode == 502) {
                    // If we get an error and a 502 it's what the FAA use to indicate thier system is down.
                    faaResult.type = 'No Data';
                    faaResult.message = 'FAA system down.';
                    faaResult.weather = 'No weather data.';
                } else {
                    // In all other cases it's some other error
                    faaResult.type = 'Error';
                    faaResult.message = 'Error requesting data.';
                    faaResult.weather = 'No weather data.';
                    }

                that.results.push(faaResult);
                that.count++;

                if (that.count === that.urls.length)
                    {
                    // We have the responses figured out so lets fire off the notifiction
                    that.sendSocketNotification('GOT-FAA-DATA', that.results);
                    }
                });
            }
        },


    socketNotificationReceived: function(notification, payload) {
        // Check this is for us and if it is let's get the airport info
        if (notification === 'GET-FAA-DATA') {
            this.getAirportData(payload);
            }
        }

    });
