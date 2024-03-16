# Touchscreen Stenography Keyboard

[![Netlify Status](https://api.netlify.com/api/v1/badges/2bf602f1-52ec-4611-8b73-bce4dd90a99b/deploy-status)](https://app.netlify.com/sites/touch-stenography-keyboard/deploys)
![GitHub License](https://img.shields.io/github/license/CosmicDNA/touchscreen-stenography-keyboard)
[![DeepScan grade](https://deepscan.io/api/teams/23301/projects/26581/branches/848067/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=23301&pid=26581&bid=848067)

## Repository

This code repository hosted at https://github.com/CosmicDNA/touchscreen-stenography-keyboard

## Purpose of The Project

The aim of this project is to render with React Three Fiber a usefull stenography touchscreen keyboard.


## Deployed Application

The application was deployed to Netlify and is available at:

https://touch-stenography-keyboard.netlify.app/

## Usage Example

### Plover connection configuration

Within Plover, make sure to select and enable the plugin `plover-engine-server-2`. More information can be found on [the web-socket server Plover plugin repository](https://github.com/user202729/plover_websocket_server). The following image shows the the default configuration for the connection. If you have created a custom `plover_engine_server_config.json`, make sure it is matching the configuration within this app.


![Plover connection](<assets/Configure web-socket connection.png>)

In the following video, it is being typed upon:

> This is an example of machine shorthand from a steno keyboard with paper.




https://github.com/CosmicDNA/touchscreen-stenography-keyboard/assets/92752640/c5960847-21dc-412f-a4d8-af9af335dbce




## Development

![touchscreen-stenography-keyboard-build](https://github.com/CosmicDNA/touchscreen-stenography-keyboard/assets/92752640/1f1da328-26f4-4ca3-8055-f623a19b7edb)

### Running

In your terminal run:
```shell
yarn && yarn dev
```

### Building

```shell
yarn build
yarn global add serve
```

### Serving Production Build

```shell
NODENV=production && serve -s build
```

## Powered by

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
