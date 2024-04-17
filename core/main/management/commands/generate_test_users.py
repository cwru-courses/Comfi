# import gzip
import csv
import json
from django.core.management.base import BaseCommand
from main.models import Movies, PastSession, CustomUser, SessionParticipant, Interest
import pandas as pd
import numpy as np
from scipy.sparse import csr_array
from scipy.sparse import diags
from scipy.linalg import norm
from ...similiarity_suggestion import SimUserSuggest
import matplotlib.pyplot as plt
import time
from django.utils import timezone

class Command(BaseCommand):
    help = 'Import data from a gzipped, tab-separated-values (TSV) formatted file, such as the formatted IMDb file(s)'
    #To run the command, do [python manage.py movie_data_import /path/to/your/dataset.tsv.gz] in the terminal

    def add_arguments(self, parser):
        parser.add_argument('file_path', type=str, help='Path to the file')
        
    def handle(self, *args, **kwargs):
        file_path = kwargs['file_path'] #Need file path
        groups_imdb_ids, groups_ratings = self.generate_mock_users(file_path,5,8)
        print(f"num_groups = {len(groups_ratings)}")
        print(f"num_users = {len(groups_ratings[0])}")
        print(f"num_ratings = {len(groups_ratings[0][0])}")
        print(f"first rating = {groups_ratings[0][0][0]}")

        self.save_parsed_data(groups_imdb_ids, groups_ratings)
        self.stdout.write(self.style.SUCCESS('Data imported successfully'))

    def generate_mock_users(self, file_path, num_rooms, max_num_users):
        ratings_df = pd.read_csv(file_path+"/ratings.csv")
        movies_df = pd.read_csv(file_path+"/links.csv")
        num_movies= movies_df.loc[len(movies_df)-1,movies_df.columns[0]]
        num_users = ratings_df.loc[len(ratings_df)-1,ratings_df.columns[0]]
        rows = ratings_df.loc[:,ratings_df.columns[0]].to_numpy() #get user id list
        rows = rows-1 #index = userID-1
        cols = ratings_df.loc[:,ratings_df.columns[1]].to_numpy()
        cols = cols-1
        ratings = ratings_df.loc[:,ratings_df.columns[2]].to_numpy()

        ratings_matrix = csr_array((ratings, (rows, cols)), shape=(num_users, num_movies))
        ratings_sum = ratings_matrix.sum(axis=1)
        counts = np.diff(ratings_matrix.indptr)
        averages = ratings_sum / counts
        avg_diag= diags(averages, 0)
        data_locations = ratings_matrix.copy()
        data_locations.data = np.ones_like(data_locations.data)
        ratings_matrix = ratings_matrix - (avg_diag*data_locations)

        #temp use from training data
        #ratings_matrix = sim_user_model.ratings.copy()

        ratings_matrix.data = ratings_matrix.data/np.abs(ratings_matrix.data)

        movies_df = pd.read_csv(file_path+"/links.csv")
        imdb_ids_array = movies_df.loc[:,movies_df.columns[1]].to_numpy()
        indices = movies_df.loc[:,movies_df.columns[0]].to_numpy()
        indices = indices-1
        index_to_imdb = csr_array((imdb_ids_array,(np.zeros(len(indices)),indices)),shape=(1,num_movies)).toarray()[0]
        groups_ratings = []
        groups_imdb_ids = []
        for group in np.arange(num_rooms):
            num_users =int( np.ceil(np.random.rand()*max_num_users)) 
            users_imdb_ids= []
            users_ratings = []
            user_indices = np.array([])
            for i in range(num_users):
                user_index = np.random.randint(0,num_users)
                #print("user_index_test ",user_index)
                while np.isin(user_index,user_indices):
                    user_index = np.random.randint(0,num_users)
                np.append(user_indices,[user_index])
                movie_indices = ratings_matrix[[user_index],:].nonzero()[1]
                movie_imdb_ids = np.take(index_to_imdb,movie_indices)
                movie_ratings = np.take(ratings_matrix[[user_index],:].toarray()[0],movie_indices)
                users_imdb_ids.append(movie_imdb_ids)
                users_ratings.append(movie_ratings)
            groups_ratings.append(users_ratings)
            groups_imdb_ids.append(users_imdb_ids)
        return groups_imdb_ids, groups_ratings

                
    
    def save_parsed_data(self, groups_imdb_ids, groups_ratings):
        num_groups = len(groups_ratings)
        for i in range(num_groups):
            curr_users_ids = groups_imdb_ids[i]
            curr_users_ratings = groups_ratings[i]
            curr_session = PastSession.objects.create(roomName=f"testRoom{i}", startTime=timezone.now())
            num_users = len(curr_users_ids)
            for j in range(num_users):
                curr_user = CustomUser.objects.create(username=f"testUser{i}{j}")
                movie_ids = curr_users_ids[j]
                movie_ratings = curr_users_ratings[j]
                SessionParticipant.objects.create(session=curr_session, user=curr_user)
                for k in range(len(movie_ids)):
                    user_likes = movie_ratings[k]>0
                    Interest.objects.create(user = curr_user, movieID = int_to_imdb_string(movie_ids[k]), like=user_likes, timesViewed = int(np.ceil(np.random.rand()*50)))


def int_to_imdb_string(imdb_int):
    imdb_string = str(imdb_int)
    while(len(imdb_string)<7):
        imdb_string= "0"+imdb_string
    return "tt"+imdb_string

def imdb_string_to_int(imdb_string):
    return int(imdb_string[2:])



