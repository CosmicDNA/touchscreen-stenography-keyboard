# Touchscreen Stenography Keyboard

[![Netlify Status](https://api.netlify.com/api/v1/badges/2bf602f1-52ec-4611-8b73-bce4dd90a99b/deploy-status)](https://app.netlify.com/sites/touch-stenography-keyboard/deploys)
![GitHub License](https://img.shields.io/github/license/CosmicDNA/touchscreen-stenography-keyboard)
[![DeepScan grade](https://deepscan.io/api/teams/23301/projects/26581/branches/848067/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=23301&pid=26581&bid=848067)

## Repository

This code repository is hosted at https://github.com/CosmicDNA/touchscreen-stenography-keyboard

## Purpose of The Project

The aim of this project is to render with React Three Fiber a usefull stenography touchscreen keyboard. So that users can safely send keystrokes to whichever computer running Plover they want.

This is a cross-platform touchscreen stenography keyboard built in React, making it a web-based solution that can run on any device with a touchscreen and a browser (Android, iOS, Windows tablets, etc.).

> [!TIP]
> To use this keyboard on a separate device like a tablet, the computer running Plover must be accessible from the internet. See the [Advanced Usage: Connecting from the Web](#advanced-usage-connecting-from-the-web) section for detailed instructions on how to set this up.

The idea is to provide a secure, highly accessible, zero-cost practice tool that people can use anywhere. It outputs steno strokes that can be picked up by Plover (via the WebSocket connection).

## Deployed Application

The application was deployed to Netlify and is available at:

https://stenography.cosmicdna.co.uk

## How It Works

This application functions as a web-based stenography keyboard that securely connects to the [Plover](https://github.com/openstenoproject/plover) stenography engine. It uses the [plover-websocket-server](https://github.com/CosmicDNA/plover-websocket-server) plugin to establish a secure, encrypted connection, allowing you to send steno strokes from your browser to Plover running on any machine.

![Plover way](assets/20240413_151518.png)
*Plover way in Cornish*

## Setup Guide

Follow these steps to connect the web keyboard to Plover.

### Step 1: Install and Configure the Plover Plugin

1.  **Install the Plugin**: The recommended way to install `plover-websocket-server` is through Plover's built-in Plugin Manager.
    -   In Plover, go to **Tools -> Plugins Manager**.
    -   Find and select **plover-websocket-server**.
    -   Click **Install/Update**, and then **Restart** Plover.

2.  **Enable the WebSocket Server Plugin**:
    -   In Plover's main window, click the **Configure** button (the gear icon).
    -   Go to the **Plugins** tab.
    -   Makse sure the *Enabled* check box is ticked as per the following image.


<p align="center">
  <a href="assets/Plover enabled plugin.png">
    <img src="assets/Plover enabled plugin.png" alt="Enabled Websocket Server Plugin" />
  </a>
  <br/>
  <em>Enabled Websocket Server Plugin</em>
</p>

### Step 2: Configure the Web Keyboard

Open the web keyboard application and click the settings icon. Ensure the configuration matches your Plover WebSocket server settings. The default values are shown below.

<p align="center">
  <a href="assets/Configure web-socket connection.png">
    <img src="assets/Configure web-socket connection.png" alt="App configuration window" />
  </a>
  <br/>
  <em>App configuration window</em>
</p>

### Keyboard Controls Explained

Within the "Keyboard" controls panel, you'll find several options to customize your experience:

-   **sendStroke**: This dropdown controls *when* the steno stroke is sent to Plover.
    -   `onKeyRelease` (Default): The stroke is sent after you lift your fingers off the screen, when the last key in the chord is released. This is the standard behavior for stenography and allows you to form the full chord before sending.
    -   `onKeyPress`: The stroke is sent the moment you press the first key. This offers a more immediate response but may be less forgiving if you don't press all keys in a chord simultaneously.

-   **lockPosition**: When checked, this option freezes the camera's position, preventing you from accidentally rotating, panning, or zooming the 3D view. This is useful once you've found a comfortable angle.

-   **performanceMonitor**: Ticking this box will display a small panel in the bottom-right corner showing real-time performance metrics like Frames Per Second (FPS). This is mainly useful for development or for diagnosing performance issues on your device.

-   **show3DText**: This toggles the visibility of the text labels on top of each key. You can turn this off for a cleaner, more minimalist look once you are familiar with the key layout.

-   **showShadows**: This option enables or disables the soft contact shadows beneath the keyboard. Disabling shadows can improve performance on less powerful devices, but will make the scene look less realistic.


### Step 3: Connect and Approve

Once configured, the web app will attempt to connect to Plover. A dialog will appear on the machine running Plover, asking you to approve the connection.

<p align="center">
  <img src="assets/Accept incoming connection.png" alt="Plover connection approval dialog" />
  <br/>
  <em>Plover connection approval dialog</em>
</p>


## Usage Example

Once connected, you can begin typing on the touchscreen keyboard. The video below demonstrates the keyboard in action.

https://github.com/CosmicDNA/touchscreen-stenography-keyboard/assets/92752640/c5960847-21dc-412f-a4d8-af9af335dbce

*Usage example for typing*

## Advanced Usage: Connecting from the Web

You can connect to a Plover instance running on your local machine (e.g., at home) from anywhere on the internet. This is useful if you want to use this web keyboard on a mobile device while your main computer with Plover is elsewhere.

To achieve this, you need to expose your local Plover WebSocket server to the internet via a public hostname. There are several ways to do this, including:

-   **Tunneling Services**: Tools like Cloudflare Tunnel (`cloudflared`) or ngrok create a secure tunnel from a public URL to your local machine. This is often the easiest and most secure method as it doesn't require opening ports on your router.
-   **Dynamic DNS (DDNS)**: If your home IP address changes, a DDNS service can give you a permanent hostname that always points to your current IP. This approach requires you to configure port forwarding on your router to direct traffic from the internet to the Plover WebSocket port (`8086` by default) on your local machine.

Below is a detailed example using Cloudflare Tunnel.

### Example: Using Cloudflare Tunnel (`cloudflared`)

There are two main ways to use `cloudflared`:

#### Method 1: Quick Tunnel (for Temporary Testing)

This is the fastest way to get a public URL, but the URL will change each time you start the tunnel.

1.  **Install `cloudflared`**: Follow the official installation instructions for your operating system.

2.  **Start the tunnel**: Run the following command in your terminal. This assumes Plover is running on the default port `8086`.
    ```shell
    cloudflared tunnel --url ws://localhost:8086
    ```

3.  **Use the public URL**: `cloudflared` will give you a public URL (e.g., `https://random-words.try.cloudflare.com`). In the web keyboard's configuration, enter this hostname (e.g., `random-words.try.cloudflare.com`) and check the **TLS** box.

#### Method 2: Named Tunnel (for Permanent Use)

This method provides a stable, permanent public URL and is the recommended approach for regular use. It requires you to have a domain managed by Cloudflare.

1.  **Install and Authenticate `cloudflared`**: Follow the official guides to install and log in.

2.  **Create a Tunnel**: Give your tunnel a memorable name.
    ```shell
    cloudflared tunnel create plover-tunnel
    ```

3.  **Route Traffic**: Link your tunnel to a public hostname (e.g., `plover.yourdomain.com`) that points to your local Plover service.
    ```shell
    cloudflared tunnel route dns plover-tunnel plover.yourdomain.com
    ```

4.  **Run the Tunnel**: Start the tunnel. It will now listen for requests at `plover.yourdomain.com` and forward them to your local Plover instance.
    ```shell
    cloudflared tunnel run --url ws://localhost:8086 plover-tunnel
    ```

5.  **Configure the Web Keyboard**: In the app's settings, enter your permanent hostname (`plover.yourdomain.com`) as the `WebSocket URL` and check the **TLS** box.

### Example: Using Dynamic DNS (DDNS)

This method gives you a persistent hostname that points to your home network's IP address. It requires you to configure port forwarding on your router.

1.  **Sign up with a DDNS Provider**: Choose a service like No-IP or DuckDNS and create a hostname (e.g., `my-plover.ddns.net`).

2.  **Set Up the DDNS Client**: Install the provider's update client on your computer or configure the DDNS service directly in your router's settings. This ensures your hostname always points to your current IP address.

3.  **Configure Port Forwarding**: This is a critical step.
    -   Log in to your router's administration page.
    -   Find the "Port Forwarding" or "Virtual Server" section.
    -   Create a new rule to forward incoming TCP traffic from an external port (e.g., `8086`) to the **internal IP address** of the computer running Plover on port `8086`.

4.  **Configure the Web Keyboard**:
    -   In the app's settings, enter your DDNS hostname (e.g., `my-plover.ddns.net`) as the `WebSocket URL`.
    -   Set the `Port` to the external port you configured in your router (e.g., `8086`).
    -   **Important**: Ensure the **TLS** box is **unchecked**, as this direct connection is not encrypted.

> [!WARNING]
> The standard DDNS and port forwarding method described above creates an insecure (`ws://`) connection. For a secure (`wss://`) connection, you would need to set up a reverse proxy (like Nginx or Caddy) with a valid TLS certificate. This is an advanced configuration and is beyond the scope of this guide. For most users, a tunneling service like `cloudflared` is the recommended and more secure option for remote access.






## Development

![touchscreen-stenography-keyboard-build](https://github.com/CosmicDNA/touchscreen-stenography-keyboard/assets/92752640/1f1da328-26f4-4ca3-8055-f623a19b7edb)
*How to start the server in production mode*

### Running

In your terminal run:
```shell
yarn && yarn start
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

## Additional Configuration

To use the plugin with the [deployed frontend](https://stenography.cosmicdna.co.uk) and follow the [plover-websocket-server](https://github.com/CosmicDNA/plover-websocket-server) guidelines, ensure your `plover_websocket_server_config.json` file includes the frontend URL in the remotes pattern section. You can use, for example, a remotes pattern that includes both `localhost:8086` and `stenography.cosmicdna.co.uk`:

```json
{
  "remotes": [
    {
      "pattern": "^https?://(localhost(:[0-9]*)?|stenography\\.cosmicdna\\.co\\.uk)/?$"
    }
  ]
}
```

## Powered by

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://www.netlify.com/)
