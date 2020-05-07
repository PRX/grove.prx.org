# grove.prx.org

Inventory management system

# Install

## Local Install

Make sure you're running the node version in `.nvmrc`, and you're off!

```sh
# install dependencies (https://yarnpkg.com/en/docs/install)
yarn install

# run tests in Chrome
yarn test
```

## Docker Install

This guide assumes you already have docker and dinghy installed.

```sh
# build a docker image
docker-compose build

# make sure your AUTH_CLIENT_ID is the .docker one
vim .env

# run the dev server
docker-compose up

# open up a browser to view
open https://grove.prx.docker

# run tests in PhantomJS
docker-compose run grove test
docker-compose run grove testonce

```

## Commonly used terms

### Podcast Metrics:

**Download**
A podcast episode download. As defined by the [IAB 2.0 Podcast Measurement guidelines](https://www.iab.com/wp-content/uploads/2017/12/Podcast_Measurement_v2-Final-Dec2017.pdf), a listener must download enough of the episode MP3 file for 1-minute of audio to be counted.

**Impression**
A podcast ad impression. Also defined in the [IAB 2.0 Podcast Measurement guidelines](https://www.iab.com/wp-content/uploads/2017/12/Podcast_Measurement_v2-Final-Dec2017.pdf), the listener must have downloaded all of the bytes in the episode MP3 file where the ad can be heard to be counted.
_Also see: “Actual”_

### Podcast Layouts:

**Placements**
The configured layouts of a podcast’s audio segments. Each is made up of a list of Zones. If there are no placements configured for an audio template, vanilla/ad-free audio will be served.
Example: [Preroll1 Preroll2 Original1 Midroll Original2 Postroll]

**Zone**
A single audio segment within an episode, including both original and ad segments.
_Example: House Preroll 2_

**Section**
A grouping of consecutive ad Zones into a single block. May also distinguish between “paid” and “house” ads.
_Example: Preroll (containing both Preroll1 and Preroll2)_

### Ad Serving:

**Campaign**
Represents an Inventory Order (IO) for a single advertiser. It can contain many Flights.

**Flight**
One or more MP3 ads plus a set of targeting information to serve with a podcast. Configured with Zones, a date-range, and an Impression goal.
Ads are fulfilled by reserving Allocations against future Inventory.
_The ad MP3 files are sometimes referred to as “Creatives”._

**Forecast**
The daily forecasted Downloads we expect a podcast to receive in the future. May also be broken out by Episode, Country, State, Keywords, etc.

**Inventory**
The daily number of Impressions available for ad Zones to be sold into in the future. (Equal to the Forecast multiplied by the ad Placements - original segment Zones do not get Inventory).

**Allocations**
The daily Inventory counts reserved by a Flight. May include additional targeting info such as Episode, Country, State, Keywords, etc.

**Availability**
The amount of unreserved Inventory left in the system (subtract the Allocations for whatever days/targeting you’re looking at).

**Actuals**
The number of real Impressions a flight has already received.
