import pathlib
import argparse
import json
import difflib
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from math import sqrt, pow, exp
from debug import debug_mention

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
        if text[i-1] == "#" and text[i] == ' ':  # Ending hash
            indices.append(i+1)  # Ignore space at start
        i += 1

    return indices

def find_all(text, value):
    """ retrieves newlines' indices """
    indices = []
    i = text.find(value)

    # While text's end has not been reached
    while i != -1:
        indices.append(i)
        i = text.find(value, i+1)  # Find next char

    return indices

def get_timestamp_URL(job, secs):
    """ gets Youtube timestamp link """
    return f"https://youtu.be/{job.video_id}?t={secs}"

# def find_mention(heading, transcript):
#     """ returns time in seconds when heading is mentioned within video """
#     best_match = {
#         "text" : "",
#         "val" : 0,
#         "start" : 0
#     }
#
#     for phrase in transcript:
#         sim = jaccard_similarity(heading, phrase["text"])
#
#         if sim > best_match["val"]:
#             best_match["text"] = phrase["text"]
#             best_match["val"] = sim
#             best_match["start"] = phrase["start"]
#
#     debug_mention(heading, best_match)
#
#     return best_match

def find_mention(heading, transcript):
    """ returns time in seconds when heading is mentioned within video """
    cos_results = st_group_compare(
        heading.lower(), [phrase["text"] for phrase in transcript])\
        .tolist()
    most_similar_phrase = transcript[cos_results.index(max(cos_results))]

    debug_mention(heading, most_similar_phrase)

    return most_similar_phrase

# Jaccard Similarity - (3/5) OG method, as accurate as other method & more efficient
# May change with transcript phrase grouping
def jaccard_similarity(x,y):
    """ returns the jaccard similarity between two lists """
    # print(f"\"{x}\" compared with \"{y}\"!")

    x = x.lower().split()
    y = y.lower().split()

    intersection_cardinality = len(set.intersection(*[set(x), set(y)]))
    union_cardinality = len(set.union(*[set(x), set(y)]))
    return intersection_cardinality/float(union_cardinality)

# SequenceMatcher Python Lib (1/5) - bad results
def match_sequence(a, b):
    return difflib.SequenceMatcher(None, a, b).ratio()*100

# # SpaCy library (1/5) - bad results but may be improved via YT (1/5)
# print("Loading spacy...")
# nlp = spacy.load('en_core_web_sm')
# def spacy_match(a, b):
#     embeddings = [nlp(phrase).vector for phrase in [a, b]]
#     distance = euclidean_distance(embeddings[0], embeddings[1])
#
#     return distance

def euclidean_distance(x, y):
    """ return euclidean distance between two lists """

    return sqrt(sum(pow(a - b, 2) for a, b in zip(x, y)))

# SentenceTransformer  (3/5) - as efficient as Jaccard but may change with transcript grouping
print("Loading sentence transformers...")
model_name = "paraphrase-MiniLM-L3-v2"
model = SentenceTransformer(model_name)
def st_compare(a, b):
    a_vecs = model.encode(a)
    b_vecs = model.encode(b)

    return cosine_similarity([a_vecs], [b_vecs])[0][0]

# SentenceTransformers can compare groups w/ groups in 1 function call
def st_group_compare(a, b):
    a_vecs = model.encode(a)
    b_vecs = model.encode(b)

    return cosine_similarity([a_vecs], b_vecs)[0]

def remove_duplicates(text):
    return " ".join(list(set(text.split(" "))))
