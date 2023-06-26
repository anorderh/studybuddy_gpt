<div style="text-align: center;">

![studybuddy](assets/studybuddyBanner.jpeg)

<div align="center"><em>*A Chrome extension emphasizing efficient video comprehension, powered by Javascript, Flask, Heroku, and ChatGPT*</em></div>

<div align="center">

  <a href="">![GitHub last commit](https://img.shields.io/github/last-commit/anorderh/studybuddy_gpt)</a>
  <a href="">![GitHub contributors](https://img.shields.io/github/contributors/anorderh/studybuddy_gpt)</a>
  <a href="">![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/anorderh/studybuddy_gpt)</a>
  <a href="">![GitHub](https://img.shields.io/github/license/anorderh/studybuddy_gpt)</a>

</div>

## Goal

This repo's goal was to package the functionality of ChatGPT's language models into an accessible and lightweight browser application. This was possible thanks to the deployment of an external `flask` server and Chrome's implementation of **background** vs. **content scripts**.

## Features

1. Generate detailed text outlines from YouTube videos in approximately <1 minute.

![rendering](assets/rendering.gif)

2) Follow alongside toggleable sections in better understanding and retaining core ideas and notable info.

![info](assets/info.gif)

3. Identify and more accurately traverse segments within your video using matched timestamps.

![timestamps](assets/timestamps.gif)

4. Search Studybuddy's locally-rendered HTML for keywords.

![search](assets/search.gif)

## Usage

**NOTE: Studybuddy has NOT yet been deployed on Chrome Web Store.** Refer to "Development".

1. Download and add the Chrome extension to your browser - refresh!

2. Navigate to a Youtube video page (matches `youtube.com/watch` URL)

3. Click generate button

4. *OPTIONAL*: Save transcripts to persist onto browser and/or export into PDFs

## Development

* While Studybuddy's core works, there are several quality-of-life fixes and bugs which I am in the process of fixing

* As such, both the extension AND webserver (API) have *not been deployed*

* While this will be addressed soon, you are still able to use the extension with a local `flask` server
  
  * In `modules/http.js`, line 6 is configured to **localhost**

## Dependencies

* [Flask](https://flask.palletsprojects.com/en/2.3.x/)

* [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)

* [OpenAI Platform](https://platform.openai.com/docs/guides/gpt)

* [Pytube](https://github.com/pytube/pytube)

## Contributing

Pull requests are welcomed. For major changes, please open an issue first to discuss what you would like to change. 

## License

[MIT License](LICENSE)
