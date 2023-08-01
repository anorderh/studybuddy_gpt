import tiktoken
from pytube import YouTube
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled


def condense_transcript(transcript_obj, scale):
    size = len(transcript_obj)
    new_transcript = []

    for i in range(0, size, scale):
        stop = None
        if i+scale >= size:
            stop = size
        else:
            stop = i+scale

        joined_phrase = " ".join([entry["text"] for entry in transcript_obj[i:stop]])
        smallest_time = transcript_obj[i]["start"]

        new_transcript.append({
            "text": joined_phrase,
            "start": smallest_time
        })

    return new_transcript


class Job:
    tokenizer = tiktoken.encoding_for_model("gpt-3.5-turbo")  # OpenAI Tokenizer

    def __init__(self, URL):
        self.url = URL

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
                          "numbered lists, and typographical emphasis, solely from the transcript" \
                          "covered in the following text. Use all remaining tokens. Include a sentence-long intro. " \
                          "Do not use bullet points."
        self.prompt_token_count = len(self.tokenizer.encode(self.prompt))

    def load_yt_video(self):
        """ grab YT video transcript and length """
        yt = YouTube(self.url)
        self.title = yt.title
        self.video_id = yt.video_id
        self.thumbnail_url = yt.thumbnail_url

        try:
            transcript_obj = YouTubeTranscriptApi.get_transcript(self.video_id)
        except TranscriptsDisabled:
            # Now with error caught, implement how Python request should return
            print("error")
            return

        transcript_obj = YouTubeTranscriptApi.get_transcript(self.video_id)

        # "\n" adjoining necessary for shortening
        raw_text = "\n".join([entry['text'] for entry in transcript_obj])
        # condensing transcript into 1/3 objects for more accurate timestamp retrieval
        self.transcript = condense_transcript(transcript_obj, 2)

        self.set_text(raw_text)
        self.orig_word_count = self.word_count

        # # Example setting markdown, for headings test
        # f = open("example_markdown.md", "r")
        # job.set_markdown(f.read())
        # f.close()



