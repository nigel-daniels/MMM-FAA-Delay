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
        },


    getAirportData: function(payload) {
        // The payload should be the request url we want to use
        var urls = payload;
        var results = [];
        this.count = 0;

        var that = this;

        for (var i = 0; i < urls.length; i++)
            {
            request({
				url: urls[i].url,
				method: 'GET',
				headers: {'accept': 'application/json'}},
				function(error, response, body) {
	                // Lets convert the body into JSON
	                var result = JSON.parse(body);
	                var path = response.request.uri.pathname;
	                var code = path.substring(path.lastIndexOf('/') + 1, path.length);

	                var faaResult = {
	                            code:       code,
	                            type:       '',
	                            message:    '',
	                            weather:    ''
	                            };

	                // Check to see if we are error free and got an OK response
	                if (!error && response.statusCode == 200) {

	                    // Is there a delay at the airport?
	                    if (result.Delay  == 'true') {

	                        // Figure out the type of delay and craft the response accordingly
	                        faaResult.type = result.Status[0].Type;

	                        switch (faaResult.type) {
	                            case 'Airport Closure':
	                                faaResult.message = 'Airport closed due to ' + result.Status[0].Reason + ', expected reopening ' + result.Status[0].ClosureEnd + '.';
	                                break;
	                            case 'Ground Stop':
	                                faaResult.message = 'Ground stoppage due to ' + result.Status[0].Reason + ', expected end is ' +  result.Status[0].EndTime + '.';
	                                break;
	                            case 'Ground Delay':
	                                faaResult.message = 'Ground delay due to ' + result.Status[0].Reason + ', average delay is ' +  result.Status[0].AvgDelay + '.';
	                                break;
	                            default:
	                                faaResult.message = 'Delay due to ' + result.Status[0].Reason + ', delays are from ' +  result.Status[0].MinDelay + ' to ' +  result.Status[0].MaxDelay + ', and ' + result.Status[0].Trend + '.';
	                                break;
	                            }
	                    } else {
	                        faaResult.Type = 'Ok';
	                        faaResult.message = result.Status[0].Reason;
	                        }

	                    // Now let's get the weather at the airport
	                    faaResult.weather = result.Weather.Weather[0].Temp[0] + ', temp ' + result.Weather.Temp + ', wind ' + result.Weather.Wind + ', visibility ' + result.Weather.Visibility + '.';

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

	                results.push(faaResult);
	                that.count++;

	                if (that.count === urls.length)
	                    {
	                    // We have the responses figured out so lets fire off the notifiction
	                    that.sendSocketNotification('GOT-FAA-DATA', results);
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
