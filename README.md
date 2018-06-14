# MMM-FAA-Delay
This a module for the [MagicMirror](https://github.com/MichMich/MagicMirror/tree/develop).  This module shows FAA published delays at major US airports.

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/nigel-daniels/MMM-FAA-Delay`.  A new folder `MMM-FAA-Delay` will appear, navigate into it.
2. Execute `npm install` to install the node dependencies.

## Config
The entry in `config.js` can include the following options:

|Option|Description|
|---|---|
|`interval`|How often the traffic is updated.<br><br>**Type:** `integer`<br>**Default value:** `900000 // 15 minutes`|
|`airports`|**Required** This is a list of airports you want to monitor for delays.  Use the airports International Air Transport Association (IATA) code.  The FAA supported IATA codes can be found here: http://www.fly.faa.gov/flyfaa/usmap.jsp<br><br>**Type:** `string`|
|`showWeather`| Display the weather for that airport.  This may not be needed if you live close by.<br><br>**Type:** `boolean`<br>**Default value:** `true // Display the weather`

Here is an example of an entry in `config.js`
```
{
    module:		'MMM-FAA-Delay',
    position:		'top_left',
    header:		'Airport Delays',
    config:		{
                interval:		300000,  // 5 min updates
                airports:		['SFO', 'SJC']
                }
},
```

## Dependencies
- [request](https://www.npmjs.com/package/request) (installed via `npm install`)

## Notes
Enjoy this module, sorry this only covers the US if there are other systems for different regions please let me know and I'll look at integration.  Feel free to submit pull requests or post issues and I'll do my best to respond.

## Thanks To...
- [Michael Teeuw](https://github.com/MichMich) for the [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) framework that made this module possible.
- [Sam Lewis](https://github.com/SamLewis0602) whose [MMM-Traffic](https://github.com/SamLewis0602/MMM-Traffic) module I use and whose code I learnt a great deal from.
- [FAA Web Services](http://services.faa.gov) for the helpful guides and information they publish.
