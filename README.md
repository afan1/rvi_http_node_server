# RVI HTTP Node.js Server [![Build Status](https://travis-ci.org/smartcar/rvi_http_node_server.svg?branch=master)](https://travis-ci.org/smartcar/rvi_http_node_server) [![Coverage Status](https://coveralls.io/repos/github/smartcar/rvi_http_node_server/badge.svg?branch=master)](https://coveralls.io/github/smartcar/rvi_http_node_server?branch=master)

A Node.js HTTP layer on top of an [RVI](https://github.com/PDXostc/rvi_core)
node. The API spec and schema can be found
[here](https://github.com/smartcar/rvi_http_api_spec).

## Getting Started

### Installation

```
git clone git@github.com:smartcar/rvi_http_node_server.git
cd rvi_http_node_server
npm install
```

### Running

By default, the server will run on port `8001`.


```
npm start
```

To test the server is running, open a new terminal tab and run the following
command.

```
curl -u mock-user:mock-password http://localhost:8001/vehicles
```


### Unit Tests

```
npm test
```

### Test Coverage

For detailed line output, open `coverage/lcov-report/index.html` in a web
browser.

```
npm run cover
```

### Linting

Uses JSHint to check for correctness.

```
npm run lint
```

### Style

Uses JSCS to enforce consistent code style.

```
npm run style
```

## Development

### Create Accounts

To add an account, go to `data/accounts.json`, add credentials, and associate
vehicles with the account. The vehicles can either be real or mock vehicle IDs.

`data/accounts.json` is in the format:

```json
{
  "<USERNAME>:<PASSWORD>": [
    "<VEHICLE_ID_1>",
    "<VEHICLE_ID_2>"
  ]
}
```

### Create Mock Vehicles

+ Generate a new vehicle ID that matches UUID v4. You can do this by going to
your terminal and running this command:

```
uuidgen
```

+ Go to `data/mock-vehicles.json` and add the vehicle ID you created with any
endpoints you want to mock out. Here is the structure of
`data/mock-vehicles.json`:

```json
{
  "<VEHICLE_ID>": {
    "<URL_PATH_1>": "<MOCK_DATA_1>",
    "<URL_PATH_2>": "<MOCK_DATA_2>"
  }
}
```

`data/mock-vehicles.json` only describes mock data for `GET` requests. All
`POST` requests will automatically respond back with (assuming the endpoint
exists and accepts `POST` requests):

```json
{
  "status": "success"
}
```

+ Add the mock vehicle to the appropriate accounts in `data/accounts.json`.
