/* Magic Mirror Module: MMM-FAA-Delay
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * MIT Licensed.
 */

Module.register('MMM-FAA-Delay', {
    defaults: {
            airport:    'SJC',  // Supported IATA codes are here: http://www.fly.faa.gov/flyfaa/usmap.jsp
            interval:   900000  // 15 minutes
        },

    start:  function() {
        console.log('Starting module: ' + this.name);

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

    getAirportData: function(that) {
        console.log(this.name + ': getAirportData, called');
        that.sendSocketNotification('GET-FAA-DATA', that.url);
        setTimeout(that.getAirportData, that.config.interval, that);
        },

    getDom: function() {
        console.log(this.name + ': getDom, called');
        var wrapper = document.createElement('div');

        if (!this.loaded) {
            wrapper.innerHTML = 'Loading airport data...';
        } else {
            wrapper.innerHTML = this.config.airport + ', ' + this.message;
            }

        return wrapper;
        },

    socketNotificationReceived: function(notification, payload) {
        console.log(this.name + ': socketNotificationReceived, called');
        console.log(this.name + ': socketNotificationReceived, notification: ' + notification);
        console.log(this.name + ': socketNotificationReceived, payload: ' + JSON.stringify(payload));
        if (notification === 'GOT-FAA-DATA' && payload.url === this.url) {
                this.loaded = true;
                this.type = payload.type;
                this.message = payload.message;
                this.weather = payload.weather;
                this.updateDom(1000);
            }
        }
    });
