# Seat Selector | Chat Widget Extensions Demo
This repository contains a demonstration of the seat selector extension showcased during our Dev Labs.

## Video
...

## Overview
The demo showcases how to extend the capabilities of a chat widget by integrating custom UI elements and interactions. These extensions are designed to be used with the Voiceflow chat widget, which can be embedded into any webpage.

## Extensions
The extensions.js file contains the following extensions:
**SeatSelectorExtension**
**SeatSelectorv2Extension**

Each extension defines how it matches certain chat interactions and how it should render or trigger effects within the chat interface.

## Usage
To use these extensions, you need to include the **extensions.js** file (or **your own file/URL**) in your project and import the extensions into your HTML file where the Voiceflow chat widget is initialized.

The **index.html** file is an example of how to set up the chat widget with the provided extensions. It includes a confetti-canvas for the confetti effect and initializes the Voiceflow chat widget with the extensions.

## Initialization
The chat widget is initialized with the following configuration:
```javascript
window.voiceflow.chat.load({
  verify: { projectID: 'your project id' },
  url: 'https://general-runtime.voiceflow.com',
  versionID: 'development', // or 'production'
  user: {
    name: 'Demo User',
  },
  render: {
    mode: 'overlay',
  },
  autostart: false,
  allowDangerousHTML: true,
  assistant: {
    extensions: [
      SeatSelectorv2Extension
    ],
  },
});
```

## Development
This example page is intended for development purposes only. To integrate the chat widget and extensions into your own project, you'll need to customize the code to fit your specific requirements and ensure that it aligns with your application's architecture and design.

### Dependencies
The Voiceflow project to test with this demo is available in this repo.

The demo uses the seatchart.js library to create the seats map.
GitHub: https://github.com/omahili/seatchart.js

### Note
Remember to replace the projectID and use the versionID of your choice.

