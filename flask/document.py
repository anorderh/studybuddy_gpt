import datetime
import pypandoc
import helpers as h
import json

class Section:
    def __init__(self, heading, body, timestamp=0):
        self.heading = heading
        self.body = body
        self.timestamp = timestamp

    def __str__(self):
        return json.dumps(self.__dict__)

def get_sections(gpt_output, transcript):
    """ organizes markdown into formatted sections"""
    sections = []
    heading_indices = h.find_headings(gpt_output)

    for idx in heading_indices:
        end = gpt_output.find("\n", idx)
        next_hash = gpt_output.find("#", end)

        heading = gpt_output[idx:end]
        body = gpt_output[end+1:next_hash]
        timestamp = int(h.find_mention(heading, transcript))

        new_section = Section(heading, body, timestamp)
        # Filtering out sections w/ empty bodies
        if body != "":
            sections.append(new_section)

    return sections

def generate_markdown(job, sections):
    """ generates markdown with hyperlinks """
    filename = str(datetime.datetime.now()).replace(':', '-')  # Unique ID based on datetime
    md = ""

    # Grabbing headings and deducing timestamps
    for s in sections:
        heading = s.heading
        body = s.body
        timestamp = s.timestamp

        # Find time & generate new heading w/ URL
        new_heading = f"# [{heading}]({h.get_timestamp_URL(job, timestamp)})"
        md += new_heading + "\n" + body

    f = open(f'{filename}.md', "w")
    f.write(md)
    f.close()

    return filename

def export_PDF(filename):
    """ creates PDF file """
    extra_args = ['--pdf-engine', '/Library/TeX/texbin/pdflatex', '-V', 'geometry:paper=a4paper']
    output_path = f"{h.get_path()}/output/{filename}.pdf"
    output = pypandoc.convert_file(f"{filename}.md", 'pdf', outputfile=output_path, extra_args=extra_args)

    assert output == "" # Error check for pypandoc



