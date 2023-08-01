<div style="text-align: center;" align="center">

![studybuddy](assets/studybuddyBanner.jpeg)

</div>
<div align="center"><em>A Chrome extension emphasizing efficient video comprehension, <br> powered by Javascript, Python, Flask, and OpenAI GPT-3 models</em></div>
<p></p>

<div align="center">

  <a href="">![GitHub last commit](https://img.shields.io/github/last-commit/anorderh/studybuddy_gpt)</a>
  <a href="">![GitHub contributors](https://img.shields.io/github/contributors/anorderh/studybuddy_gpt)</a>
  <a href="">![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/anorderh/studybuddy_gpt)</a>
  <a href="">![GitHub](https://img.shields.io/github/license/anorderh/studybuddy_gpt)</a>

</div>

## Demo

https://github.com/anorderh/studybuddy_gpt/assets/60157725/05964fcf-d5fa-4c5d-860a-ab07b5a6379b

## Goal

This project's goal is to package the functionality of OpenAI's language processing models into an accessible and lightweight browser application. This project follows a client server design pattern, using an external `flask` server for API requests and data parsing.

## Features

1. **Make video content more straightforward by extracting & rendering it as text within the browser.**

2. **Format by topic and package content into toggleable sections, containing a heading, body, and if applicable, Markdown formatting.**

3. **Identify topics' specific mention during a video and generate timestamps for quick navigation.**

4. **Enable keyword and important phrase searching through rendered text.**

5. **Package and export text as PDFs for later reference and local storage.**

## Limitations

This project is currently **in development**.
* Ongoing tasks...
	- [ ] Flask server's handling for OpenAI errors
	- [ ] Client's handling for Flask server errors
	- [ ] Overflow text leaving blank space in PDF exports
	- [ ] Parsing YT desc sections
	- [ ] PDF export options
	- [ ] Reversing sidepanel iframe implementation
	- [ ] Minimize sidepanel
	- [ ] Bundling multiple OpenAI requests for longer videos
* This extension has not been deployed onto the Chrome Web app store
	* In addition, the web server has not been deployed (runs on localhost)
    
This project is best suited for videos 8-18 minutes long, and reaches inaccuracies beyond 30 minutes.
* OpenAI proposes a 4000 word token limit per request
* Videos longer are shortened in order to fit inside the 4000 word limit
	* Shortening does *not* mean an abrupt cutoff, instead removing unnecessary phrases. However, excessive length may lead shortening to cause inaccuracies.
	* Until multiple request functionality is finished.
    
Timestamps are liable to inaccuracy
* Current ID involves matching headings with phrases within the video's transcript
* Headings can be mismatched with unrelated sections
	* Can be alleviated by parsing YT sections in descriptions
    
Exporting PDFs with Markdown is currently not supported.
* While the browser is able to render Markdown thanks to "md-block.js", the current PDF exporting does not recognize the syntax and outputs as plain text
    
This project uses GPT-3 modes in parsing Youtube video content, and is liable to misrepresented extracted info.
* As opposed to summarization, this project attempts to cover video content in bulk.
* As a result, it is poor at detecting conveyed sarcasm and/or nuance.
    
## Dependencies

* [Flask](https://flask.palletsprojects.com/en/2.3.x/)
* [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)
* [OpenAI Platform](https://platform.openai.com/docs/guides/gpt)
* [Pytube](https://github.com/pytube/pytube)
* [jsPDF](https://github.com/parallax/jsPDF)
* [md-block.js](https://github.com/leaverou/md-block)
* [html2canvas](https://github.com/niklasvh/html2canvas)

## Contributing

Pull requests are welcomed. For major changes, please open an issue first to discuss what you would like to change. 

## License

[MIT License](LICENSE)
