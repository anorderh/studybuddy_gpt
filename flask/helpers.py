import pathlib
import argparse
import json

def obj_dict(obj):
    return obj.__dict__

def extract_args():
    parser = argparse.ArgumentParser(description='Generate detailed reports from videos.')
    parser.add_argument("URL", help="Input file.")

    return parser.parse_args()

def output_py_objs(objs):
    for obj in objs:
        print(json.dumps(obj.__dict__, indent=2))

def get_path():
    return pathlib.Path(__file__).parent.resolve()

def find_headings(text):
    """ retrieves headings' starting indices """
    indices = []

    i = 0
    while i < len(text):
        if text[i-1] == "#" and text[i] == ' ': # Ending hash
            indices.append(i+1) # Ignore space at start
        i += 1

    return indices

def get_timestamp_URL(job, secs):
    """ gets Youtube timestamp link """
    return f"https://youtu.be/{job.video_id}?t={secs}"

def find_mention(heading, transcript):
    """ returns time in seconds when heading is mentioned within video """
    best_match = {
        "text" : "",
        "val" : 0,
        "start" : 0
    }

    for phrase in transcript:
        sim = jaccard_similarity(heading, phrase["text"])

        if sim > best_match["val"]:
            best_match["text"] = phrase["text"]
            best_match["val"] = sim
            best_match["start"] = phrase["start"]

    return best_match["start"]

def jaccard_similarity(x,y):
    """ returns the jaccard similarity between two lists """
    # print(f"\"{x}\" compared with \"{y}\"!")

    x = x.lower().split()
    y = y.lower().split()

    intersection_cardinality = len(set.intersection(*[set(x), set(y)]))
    union_cardinality = len(set.union(*[set(x), set(y)]))
    return intersection_cardinality/float(union_cardinality)