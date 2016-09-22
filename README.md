# tr-influx-fake-messages
a naive script to fill the trustroots mongoDB with fake testing
user &amp; message data (or create a file to import to influxdb)

## Caution!
running this script will
__delete all your current data__ from the MongoDB database
(the script drops the `trustroots-dev` database at the beginning)

you can remove this functionality (TODO prompt)

## Prerequisities
- Node v6.x or another version with a good support for ES6
- the latest version of [trustroots](https://github.com/trustroots/trustroots) installed
- the database should be named `trustroots-dev` (default)
- mongoDB running on default port


## Installation
- clone this repository
- in the root folder run `npm install`

## Usage
- run `node index.js`
- by default 3000 users are created with names `influx0` - `influx2999` and password `asdfasdf`
- by default around 2250 threads are created (alltogether around 6000 messages). you can change it by
playing with constants at the beginning of the `index.js` file
- you won't see any message threads. this script is very naive

## Create influxDB data file
with a small change of code you can create a file `fake_messages_sent.txt`


import it into your `influxdb` (run in terminal)

    influx -import -path=fake_messages_sent.txt -precision=s

it will save the data into a new database `msg_db`

you need influxdb v1.0+ (or maybe v0.9+) to do this

you can look at the data with Grafana

## License
MIT
