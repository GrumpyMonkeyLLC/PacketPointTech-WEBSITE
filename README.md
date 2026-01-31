# Packet Point Technologies Website

Professional dark-themed website for Packet Point Technologies LLC.

## Setup

1. Clone this repository
2. Download logo files (see below)
3. Open `index.html` in a browser or deploy to your hosting

## Logo Files Needed

Download the following logos and place them in `images/logos/`:

- `cisco.svg` - [Download from Cisco Brand Center](https://www.cisco.com/c/en/us/about/brand-center.html)
- `arista.svg` - [Download from Arista](https://www.arista.com)
- `ruckus.svg` - [Download from Ruckus](https://www.commscope.com/ruckus)
- `ubiquiti.svg` - [Download from Ubiquiti](https://www.ui.com)
- `juniper.svg` - [Download from Juniper](https://www.juniper.net)
- `azure.svg` - [Download from Microsoft](https://azure.microsoft.com/en-us/resources/logos)
- `aws.svg` - [Download from AWS](https://aws.amazon.com/architecture/icons/)
- `microsoft365.svg` - [Download from Microsoft](https://developer.microsoft.com/en-us/fluentui)
- `sophos.svg` - [Download from Sophos](https://www.sophos.com)
- `paloalto.svg` - [Download from Palo Alto Networks](https://www.paloaltonetworks.com)
- `zabbix.svg` - [Download from Zabbix](https://www.zabbix.com/logo)
- `prometheus.svg` - [Download from Prometheus](https://prometheus.io)

**Alternative:** Use a logo service like [VectorLogoZone](https://www.vectorlogo.zone/) or [Simple Icons](https://simpleicons.org/) to get SVG versions.

## Structure

```
packet-point-website/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   └── main.js         # JavaScript functionality
├── images/
│   └── logos/          # Company logos (SVG format)
└── README.md           # This file
```

## Features

- Fully responsive design
- Dark theme
- Smooth scrolling
- Mobile menu
- Hover effects on technology logos
- Contact information with phone and email
- Services showcase
- Technology/platform showcase

## Deployment

### Azure Static Web Apps (Recommended)
1. Push your code to GitHub
2. Go to [Azure Portal](https://portal.azure.com)
3. Create a new Static Web App
4. Connect your GitHub repository
5. Set build configuration:
   - **App location:** `/`
   - **Api location:** (leave empty)
   - **Output location:** (leave empty)
6. Azure will automatically build and deploy your site
7. Your site will be live at `https://[your-app-name].azurestaticapps.net`

The included `staticwebapp.config.json` file handles routing and caching automatically.

### GitHub Pages
1. Push to GitHub
2. Go to Settings > Pages
3. Select branch and root folder
4. Your site will be live at `https://yourusername.github.io/repo-name`

### Other Hosting
Upload all files to your web host, maintaining the folder structure.

## Contact

For updates or issues, contact info@packetpointtechnologies.com
