# fritzboxcallmonitor
A deno project which monitors incoming and outgoing calls on a Fritz!Box and sends them to Zammad.

## Configuration
The configuration is done via environment variables or via a `.env` file. The following variables are available:
```
ZAMMADURL=The URL of your Zammad instance
ALLOWEDNUMBERS=The numbers which are processed (separated by comma).
FRITZBOX_URL=The URL of your Fritz!Box
FRITZBOX_PORT=The port of your Fritz!Box
```

## Usage
### Deno
Assuming you have deno installed, you can run the project with the following command:
```bash
deno run --allow-env --allow-read --allow-net index.ts
```

### Docker Compose
You can also run the project with docker. The following command will start the project:
```bash
docker compose up
```
