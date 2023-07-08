import datetime
import os
import openai
import shorten as p_s
import gptIntegration as p_gpt
import document as p_d
import helpers as h
import json
from flask import Flask, request
from flask_cors import CORS, cross_origin
from Job import Job

app = Flask(__name__)
CORS(app)
openai.api_key = os.getenv("OPENAI_API_KEY")


class Result:
    """ Packaging output for transmission """

    def __init__(self, info, content):
        self.info = info
        self.content = content

    def __str__(self):
        return json.dumps(self.__dict__)


def run_job(URL):
    """ Tasks for processing YouTube video """

    print("Initializing job members...")
    start = datetime.datetime.now()
    job = Job(URL, False)  # Boolean for debug mode

    print("Stage 1 - Shortening transcript to fit GPT-3 token limit")
    p_s.shorten_transcript(job)

    print("Stage 2 - Sending API request to GPT-3")
    p_gpt.generate_gpt_output(job)

    print("Stage 3 - Parsing output to identify headings, relevant timestamps, & body")
    sections = p_d.get_sections(job.gpt_output, job.transcript)

    print("Stage 4 - Packaging metadata & parsed sections into JSON obj for http responses")
    end = datetime.datetime.now();
    res = Result(
        info={'title': job.title,
                  'thumbnailURL': job.thumbnail_url,
                  'timeElapsed': str((end - start).total_seconds()),
                  'shorteningCycles': job.shortening_cycles,
                  'origWordCount': job.orig_word_count,
                  'finalWordCount': job.word_count},
        content=sections
    )
    return res
    # h.output_py_objs(sections)

    # # Stage 5 - Generating markdown file based on parsed output
    # print("5 - Generating markdown file...")  # Stage 5
    # md_filename = p_d.generate_markdown(job, sections)

@app.route("/process", methods=['POST', 'OPTIONS'])
@cross_origin(origin='chrome-extension://*')
def process():
    """ API endpoint for processing Youtube vid URL """

    args = request.get_json()
    print(args)

    URL = args['url']
    if not URL:  # No URL present
        return "<p>Invalid data submitted.<p>"
    else:
        return json.dumps(run_job(URL), default=h.obj_dict)


# @app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'chrome-extension://*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, DELETE, POST, HEAD, OPTIONS')
    return response


if __name__ == '__main__':
    app.run(threaded=True, port=5000)
