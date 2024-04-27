# ChromeCoPilotExtension

An AI assistant built into the Chrome browser.

## Overview

This Project was born out of a little idea to build something with the Chrome Extensions API after randomly reading its docs one morning. The Project was initially built with vanilla JS in the ChromeCoPilot repo but is now being refactored to TypeScript + React after facing several bottlenecks. Below is a list of planned features:

### RoadMap

- [x] Simple Chat Interface with Google Gemini
- [ ] Support for other chatbots (GPT3.5, Claude, etc)
- [ ] Chat with Documents (pdf, docx, txt, etc) with a local vector store
- [ ] Voice Inputs with local transcription
- [ ] AI assistant (text-to-speech)
- [ ] Fetch information from open tabs
- [ ] Input editor (like Grammarly)
- [ ] Agentic LLMs

## Installation

This project was built with yarn. If you don't have yarn installed, you can follow the instructions [here](https://yarnpkg.com/getting-started/install) to install it. After installing yarn, run the following commands to set up the project:

```bash
yarn install
yarn run
# or
yarn run watch
```
This will compile the project into a dist folder. In Chrome, open the Manage Extensions, turn on developer mode, and click Load Unpacked. Select the dist folder and you're good to go.

## Usage
Simply log in and start messaging. Explore the features mentioned in the roadmap to get the most out of the extension.

## Contributing
Read the contributing guide [here](Contributing.md) to get started.

## License
This project is licensed under the MIT License.
