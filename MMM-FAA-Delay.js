/* Magic Mirror Module: MMM-FAA-Delay
 * Version: 1.0.0
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * MIT Licensed.
 */

Module.register('MMM-FAA-Delay', {

    defaults: {
            interval:   	900000,  	// 15 minutes
			showWeather: 	true		// Display the weather for the airports
        },


    start:  function() {
        Log.log('Starting module: ' + this.name);

        if (this.data.classes === 'MMM-FAA-Delay') {
            this.data.classes = 'bright medium';
            }

        // Set up the local values, here we construct the request url to use
        this.loaded = false;
        this.urls = [];

        for (i in this.config.airports) {
            //this.urls.push({code: this.config.airports[i], url: 'http://services.faa.gov/airport/status/' + this.config.airports[i] + '?format=application/json'});
			this.urls.push({code: this.config.airports[i], url: 'https://soa.smext.faa.gov/asws/api/airport/status/' + this.config.airports[i]});
            }

        this.results = [];

        // Trigger the first request
        this.getAirportData(this);
        },


    getStyles: function() {
            return ['airport.css', 'font-awesome.css'];
        },


    getAirportData: function(that) {
        // Make the initial request to the helper then set up the timer to perform the updates
        that.sendSocketNotification('GET-FAA-DATA', that.urls);
        setTimeout(that.getAirportData, that.config.interval, that);
        },


    getDom: function() {
        // Set up the local wrapper
        var wrapper = null;

        // If we have some data to display then build the results table
        if (this.loaded) {
            wrapper = document.createElement("table");
		    wrapper.className = "airport small";

            for (i in this.results)
                {
                // Set up the first row with the aiport data
                airportRow = document.createElement("tr");

                airportCode = document.createElement("td");
                airportCode.className = "code bright";
                airportCode.innerHTML = this.results[i].code;


                airportInfo = document.createElement("td");
                airportInfo.className = "type bright";
                airportInfo.innerHTML = this.results[i].type;

                airportRow.appendChild(airportCode);
                airportRow.appendChild(airportInfo);

                // Set up the next row with detailed information
                messageRow = document.createElement("tr");

                blank1  = document.createElement("td");
                airportMessage = document.createElement("td");
                airportMessage.className = "message normal";
                airportMessage.innerHTML = this.results[i].message;

                messageRow.appendChild(blank1);
                messageRow.appendChild(airportMessage);
				
                // Set up the last row with weather data
                weatherRow = document.createElement("tr");

                blank2  = document.createElement("td");
                airportWeather = document.createElement("td");
                airportWeather.className = "weather normal";
                airportWeather.innerHTML = this.results[i].weather;

                weatherRow.appendChild(blank2);
                weatherRow.appendChild(airportWeather);

                // Add the rows to the table
                wrapper.appendChild(airportRow);
                wrapper.appendChild(messageRow);
                if (this.config.showWeather) {wrapper.appendChild(weatherRow);}
                }
        } else {
            // Otherwise lets just use a simple div
            wrapper = document.createElement('div');
            wrapper.innerHTML = 'Loading airport data...';
            }

        return wrapper;
        },

    socketNotificationReceived: function(notification, payload) {
        // check to see if the response was for us and used the same url
        if (notification === 'GOT-FAA-DATA') {
                // we got some data so set the flag, stash the data to display then request the dom update
                this.loaded = true;
                this.results = payload;
                this.updateDom(1000);
            }
        }
    });
