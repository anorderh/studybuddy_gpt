import helpers as h
import datetime
from Job import condense_transcript
from youtube_transcript_api import YouTubeTranscriptApi

job_ID = str(datetime.datetime.now()).replace(':', '-')


def debug_mention(heading, best_match):
    with open(f'output/heading_report_{job_ID}.txt', 'a') as f:
        f.write(f'{heading}\n')
        f.write(f'Matched with \"{best_match["text"]}\"\n')
        f.write(f'Timestamp: {best_match["start"]}\n\n')
    f.close()


def debug_generate_comp(heading, transcript):
    comp_heading = heading.lower()
    similarities = h.st_group_compare(comp_heading, [phrase["text"] for phrase in transcript])
    similarities = similarities.tolist()  # np to array

    # Getting top 5 comparison values
    most_similar = sorted(similarities)[-5:]
    print(most_similar)

    matches = []
    for val in most_similar:
        matches.append(
            {
                "text": transcript[similarities.index(val)]["text"],
                "val": val
            }
        )

    print(f"\nTop 5 matches with \"{heading}\"")
    for i in range(len(matches)):
        cur = matches[i]

        print(f'{i + 1}: {cur["text"]}')
        print(f'{cur["val"]}')


if __name__ == '__main__':
    video_id = "51foBSsRpJk"
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    transcript = condense_transcript(transcript, 2)

    headings = [
        "Comprehensive Review of Pirated Android Game Consoles",
        "Hyper Base Console ",
        "Game Station 5",
        "Arcade Box",
        "Hyper Base FC Metro Gaming Console",
        "Super Console X Pro",
    ]

    for heading in headings:
        debug_generate_comp(heading, transcript)

        # print(f'\"{heading}\" - matched with')
        # phrase = h.find_mention(heading, transcript)
        # print(f'{phrase}\n')

        # print(f'{phrase["text"]}')
        # print(f'{phrase["start"]}')

