import gzip
import csv
import json
from django.core.management.base import BaseCommand
from Comphy.core.main.models import Movies

class Command(BaseCommand):
    help = 'Import data from a gzipped, tab-separated-values (TSV) formatted file, such as the formatted IMDb file(s)'
    #To run the command, do [python manage.py movie_data_import /path/to/your/dataset.tsv.gz] in the terminal

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the file')
        
    def handle(self, *args, **kwargs):
        file_path = kwargs['file_path'] #Need file path
        data = self.parsed_movie_data(file_path)
        self.save_parsed_data(data)
        self.stdout.write(self.style.SUCCESS('Data imported successfully'))

    def movie_data_parser(self, file_path):
        parsed_movie_data = [] #holds the parsed movie data
        with gzip.open(file_path, 'rt', encoding='utf-8') as f:
            reader = csv.reader(f, delimiter='\t')
            headers = next(reader)  # Read the header row

            for row in reader:
                data_dict = {}

                for header, value in zip(headers, row):
                    if value == '\\N':
                        value = None

                    # Map headers to model fields and store data in the dictionary
                    #Title
                    if header == 'primaryTitle':
                        data_dict['title'] = value

                    #Movie ID
                    elif header == 'tconst':
                        data_dict['movieID'] = value

                    #Media Type
                    elif header == 'titleType':
                        data_dict['media_type'] = value

                    #Release Year
                    elif header == 'startYear':
                        data_dict['release_year'] = value
                    
                    #Runtime/length (in minutes)
                    elif header == 'runtimeMinutes':
                        data_dict['runtime'] = value
                    
                    #Genres (up to 3 in array fashion, WIP)
                    elif header == 'genres':
                        instance_input = Movies()
                        data_dict['genres_array'] = value

                    #Poster URLS (WIP)
                    #elif header == 'your_header_name':
                        #data_dict['your_model_field_name'] = value

                parsed_movie_data.append(**data_dict)

        return parsed_movie_data
    
     def save_parsed_data(self, data):
        for item in data:
            # Convert array data to JSON before saving
            if 'genres_array' in item:
                item['genres_array'] = json.dumps(item['genres_array'])
            
            Movies.objects.create(**item)
