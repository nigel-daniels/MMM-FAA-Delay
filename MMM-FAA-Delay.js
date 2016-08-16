/* Magic Mirror Module: MMM-FAA-Delay
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * MIT Licensed.
 */

Module.register('MMM-FAA-Delay'),{
    defaults: {
            airport:    'SJC',  // Supported IATA codes are here: http://www.fly.faa.gov/flyfaa/usmap.jsp
            max:        true,   // Use the max delay time
            interval:   900000  // 15 minutes
        },

    start:  function() {
        Log.info('Starting module: ' + this.name);
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

    this.getAirportData(that) {
        that.sendSocketNotification('GET-FAA-DATA', that.url);
        setTimeout(that.getAirportData, that.config.interval, that);
        },

    getDom: function() {
        var wrapper = document.createElement('div');

        if (!this.loaded) {
            wrapper.innerHTML = 'Loading aiport data...';
        } else {
            wrapper.innerHTML = this.config.airport + ', ' + this.message;
        }

        return wrapper;
        },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GOT-FAA-DELAY' && payload.url === this.url) {
                this.loaded = true;
                this.type = payload.type;
                this.message = payload.message;
                this.weather = payload.weather;
                this.updateDom(1000);
            }
        }
    });
