/*
 */

Module.register('MMM-FAA-Delay', {
    defaults: {
            airport:    'SJC',  // Supported IATA codes are here: http://www.fly.faa.gov/flyfaa/usmap.jsp
            interval:   900000  // 15 minutes
        },

    start:  function() {
        Log.log('Starting module: ' + this.name);

        if (this.data.classes === 'MMM-FAA-Delay') {
            this.data.classes = 'bright medium';
            }

        this.loaded = false;
        this.url = 'http://services.faa.gov/airport/status/' + this.config.airport + '?format=application/json';
        this.type = '';
        this.message = '';
        this.weather = '';

        this.getAirportData(this);
        },

    getStyles: function() {
            return ['airport.css', 'font-awesome.css'];
        },

    getAirportData: function(that) {
        //Log.log(this.name + ': getAirportData, called');
        that.sendSocketNotification('GET-FAA-DATA', that.url);
        setTimeout(that.getAirportData, that.config.interval, that);
        },

    getDom: function() {
        //Log.log(this.name + ': getDom, called');
        var wrapper = null;

        if (this.loaded) {
            wrapper = document.createElement("table");
		    wrapper.className = "airport small";

            // Set up the first row with the aiport data
            airportRow = document.createElement("tr");

            airportCode = document.createElement("td");
            airportCode.className = "code bright";
            airportCode.innerHTML = this.config.airport;


            airportInfo = document.createElement("td");
            airportInfo.className = "type bright";
            airportInfo.innerHTML = this.type;

            airportRow.appendChild(airportCode);
            airportRow.appendChild(airportInfo);

            // Set up the next row with detailed information
            messageRow = document.createElement("tr");

            blank1  = document.createElement("td");
            airportMessage = document.createElement("td");
            airportMessage.className = "message dimmed";
            airportMessage.innerHTML = this.message;

            messageRow.appendChild(blank1);
            messageRow.appendChild(airportMessage);
            // Set up the last row with weather data
            weatherRow = document.createElement("tr");

            blank2  = document.createElement("td");
            airportWeather = document.createElement("td");
            airportWeather.className = "weather dimmed";
            airportWeather.innerHTML = this.weather;

            weatherRow.appendChild(blank2);
            weatherRow.appendChild(airportWeather);

            // Add the rows to the table
            wrapper.appendChild(airportRow);
            wrapper.appendChild(messageRow);
            wrapper.appendChild(weatherRow);
        } else {
            wrapper = document.createElement('div');
            wrapper.innerHTML = 'Loading airport data...';
            }

        return wrapper;
        },

    socketNotificationReceived: function(notification, payload) {
        //Log.log(this.name + ': socketNotificationReceived, called');
        //Log.log(this.name + ': socketNotificationReceived, notification: ' + notification);
        //Log.log(this.name + ': socketNotificationReceived, payload: ' + JSON.stringify(payload));
        if (notification === 'GOT-FAA-DATA' && payload.url === this.url) {
                this.loaded = true;
                this.type = payload.type;
                this.message = payload.message;
                this.weather = payload.weather;
                this.updateDom(1000);
            }
        }
    });
