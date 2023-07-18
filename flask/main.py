import os
import openai
import shorten as p_s
import gptIntegration as p_gpt
import document as p_d
import helpers as h
from Job import Job
from youtube_transcript_api import YouTubeTranscriptApi


def start():
    # API keys
    openai.api_key = os.getenv("OPENAI_API_KEY")

    print("Initializing studybuddy job...")
    job = Job(h.extract_args().URL, True)  # Boolean determining debug mode

    # Stage 1 - Shortening transcript to fit GPT-3 token limit
    print("1 - Shortening transcription...")
    p_s.shorten_transcript(job)
    print(job.text)

    # Stage 2 - Sending API request to GPT-3
    print("2 - Prompting GPT chatbot...")
    p_gpt.generate_gpt_output(job)

    # Stage 3 - Parsing output to identify headings, relevant timestamps, & body
    print("3 - Creating sections...")
    sections = p_d.get_sections(job.gpt_output, job.transcript)  # Stage 4
    h.output_py_objs(sections)

    # Stage 4 - Generating markdown file based on parsed output
    print("4 - Generating markdown file...")
    md_filename = p_d.generate_markdown(job, sections)

    # # Stage 5 - Exporting markdown to pDF
    # print("5 - Creating PDF file...")
    # p_d.export_PDF(md_filename);

    # API keys
    openai.api_key = os.getenv("OPENAI_API_KEY")

    print("Initializing studybuddy job...")
    job = Job(h.extract_args().URL, True)  # Boolean determining debug mode

    # Stage 1 - Shortening transcript to fit GPT-3 token limit
    print("1 - Shortening transcription...")
    p_s.shorten_transcript(job)
    print(job.text)

    # Stage 2 - Sending API request to GPT-3
    print("2 - Prompting GPT chatbot...")
    p_gpt.generate_gpt_output(job)

    # Stage 3 - Parsing output to identify headings, relevant timestamps, & body
    print("3 - Creating sections...")
    sections = p_d.get_sections(job.gpt_output, job.transcript)  # Stage 4
    h.output_py_objs(sections)

    # Stage 4 - Generating markdown file based on parsed output
    print("4 - Generating markdown file...")
    md_filename = p_d.generate_markdown(job, sections)

    # # Stage 5 - Exporting markdown to pDF
    # print("5 - Creating PDF file...")
    # p_d.export_PDF(md_filename);


if __name__ == '__main__':
    video_id = "51foBSsRpJk"
    transcript = YouTubeTranscriptApi.get_transcript(video_id)

    headings = [
        "Comprehensive Review of Pirated Android Game Consoles",
        "Hyper Base Console ",
        "Game Station 5",
        "Arcade Box",
        "Hyper Base FC Metro Gaming Console",
        "Super Console X Pro",
    ]

    # heading = "Hyper Base: Is It Worth the Hype?"
    # comp = [
    #     "Deep learning is so straightforward.",
    #     "This is so difficult, like rocket science.",
    #     "I can't believe how much I struggled with this."
    # ]

    for heading in headings:
        h.find_mention(heading, transcript)

    # for s in comp:
    #     print(h.st_compare(source, s))
    # start()
