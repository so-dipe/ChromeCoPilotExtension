# ChromeCoPilotExtension
An AI assistant built into the chrome browser.

## Overview
This Project was born out of a little idea to build something with the chrome extensions api after reading it's docs randomly one morning. The Project was initially built with vanilla js in the ChromeCoPilot repo but now its being refactored to typescript + React after I faced a lot of bottlenecks working vanilla js. I am not an expert with React and this is only my second project using it. Below is a list of things I hope to make the extension do something in the near future.

### RoadMap
- Simple Chat Interface with Google Gemini
- Support for other chatbots (GPT3.5, Claude, etc)
- Chat with Documents (pdf, docx, txt, etc) with local vector store
- Voice Inputs with local transription
- AI assistant (text-to-speech)
- Fetch information from open tabs
- Input editor (like grammarly)
- Agentic LLMs

## Installation

This project was built with yarn. I am not sure how yarm is installed but to run the project, install the dependencies and run `yarn run` or `yarn run watch`. This will compile the project into a dist folder. In chrome, open the Manage Extensions, turn on developer mode and click Load Unpacked. Select the dist folder and viola.

## Usage

Just Login and start messaging

## Contributing

Read the contributing guide to get started.
