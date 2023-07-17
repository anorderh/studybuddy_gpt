import tiktoken
import datetime
from pytube import YouTube
from youtube_transcript_api import YouTubeTranscriptApi

class Job:
    tokenizer = tiktoken.encoding_for_model("gpt-3.5-turbo")  # OpenAI Tokenizer

    def __init__(self, URL, debug):
        self.url = URL
        self.debug = debug

        # metadata
        self.title = None
        self.video_id = None
        self.thumbnail_url = None
        self.shortening_cycles = 0

        self.text = None
        self.token_count = 0
        self.orig_word_count = 0
        self.word_count = 0

        self.prompt = None
        self.prompt_token_count = 0

        self.transcript = None
        self.gpt_output = None

        self.build_prompt()
        self.load_yt_video()

    def set_text(self, text):
        self.text = text
        self.token_count = len(self.tokenizer.encode(text)) + self.prompt_token_count
        self.word_count = len(text.split())

    def set_gpt_output(self, gpt_output):
        print(gpt_output)
        self.gpt_output = gpt_output

    def set_markdown(self, markdown):
        self.markdown = markdown

    def build_prompt(self):
        self.prompt = "Generate a detailed, and comprehensive Markdown file, with headings, " \
                          "bullets, numbered lists, and typographical emphasis, solely from the transcript" \
                          "covered in the following text. Use all remaining tokens. Include a sentence-long intro."
        self.prompt_token_count = len(self.tokenizer.encode(self.prompt))

    def load_yt_video(self):
        """ grab YT video transcript and length """
        start = None

        yt = YouTube(self.url)
        self.title = yt.title
        self.video_id = yt.video_id
        self.thumbnail_url = yt.thumbnail_url

        if self.debug:  # Transcript req - start
            start = datetime.datetime.now()

        transcript_obj = YouTubeTranscriptApi.get_transcript(self.video_id)

        if self.debug:  # Transcript req - end
            end = datetime.datetime.now()
            print(f"downloading yt: {str((end - start).total_seconds())}")

        self.transcript = transcript_obj
        raw_transcript = "\n".join([entry['text'] for entry in transcript_obj])
        self.set_text(raw_transcript)

        self.orig_word_count = self.word_count

        # # Example setting markdown, for headings test
        # f = open("example_markdown.md", "r")
        # job.set_markdown(f.read())
        # f.close()
