import datetime
import requests

MAX_TOKEN_SIZE = 2048 - 10 # 10 is buffer between local 'Tiktoken' tokenizer & ChatGPT 'Tiktoken' tokenizer

def shorten_transcript(job):
    start = None
    iterations = 0

    """ shortens input until it fits into token size boundaries """
    while job.token_count > MAX_TOKEN_SIZE:
        if (iterations >= 5):
            print("Error. This video's transcript cannot be properly summarized. Closing program.")
            exit(1)
        target_percent = (MAX_TOKEN_SIZE / job.token_count) - 0.05 # -5 % to prevent deadlocks
        old_token_count = job.token_count

        data = {
            "text": job.text,
            "percnt": str(int(target_percent * 100)),
            "modd": "1",
            "min_length": str(0.25 * job.word_count),
            "max_length": str(0.4 * job.word_count),
            "captcha": "0"
        }
        url = "https://www.editpad.org/tool/tool/summarizingTool"

        response = requests.post(
            url=url,
            data=data,
        )
        res_dict = response.json()
        job.set_text(res_dict["content"].replace("\n", " ")) # Update shortened output

        print(f"Shortening spin executed! Percent:{target_percent} | Tokens: {old_token_count} -> {job.token_count}")
        iterations += 1

    job.shortening_cycles = iterations