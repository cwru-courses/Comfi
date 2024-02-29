import numpy as np
import pandas as pd
from scipy.sparse import csr_array
from scipy.sparse import diags
from scipy.linalg import norm

class SimUserSuggest():
    def __init__(self, data_folder_location, num_similiar=5):
        ratings_df = pd.read_csv(data_folder_location+"/ratings.csv")
        movies_df = pd.read_csv(data_folder_location+"/links.csv")
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
        self.ratings = ratings_matrix
        
        imdb_ids_array = movies_df.loc[:,movies_df.columns[1]].to_numpy()
        indices = movies_df.loc[:,movies_df.columns[0]].to_numpy()
        indices = indices-1
        self.index_to_imdb = csr_array((imdb_ids_array,(indices)),shape=(num_movies)).to_numpy()
        self.num_similiar = num_similiar
        self.imdb_to_index = {imdb_ids_array[i]: indices[i] for i in range(len(imdb_ids_array))}
        self.num_movies = num_movies
    
    def predict(self,users_imdb_ids, users_ratings, num_predictions=5 ):
        data = users_ratings[0]
        data = data-np.mean(data)
        rows = np.ones((len(users_ratings[0])))*0
        cols = np.array([self.imdb_to_index[id] for id in users_imdb_ids[0]])
        for i in np.arange(1,len(users_ratings)):
            curr_ratings=  users_ratings[i]
            curr_ratings = curr_ratings-np.mean(curr_ratings)
            data = np.append(data,curr_ratings)
            rows = np.append(rows,np.ones((len(users_ratings[i])))*i)
            new_cols = np.array([self.imdb_to_index[id] for id in users_imdb_ids[i]])
            cols = np.append(cols,new_cols)
        users_sparse = csr_array( (data,(rows,cols)),shape=(len(users_ratings),self.num_movies))
        
        best_indices = suggest_movies(self.ratings,users_sparse,num_similiar=self.num_similiar,num_suggestions = num_predictions)
        return np.array([self.index_to_imdb[index] for index in best_indices])
        
        

def construct_ratings_matrix():
    movies_df=pd.read_csv("ml-25m/links.csv")
    ratings_df = pd.read_csv("ml-25m/ratings.csv")
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
    return ratings_matrix

def suggest_movies(ratings_data, users_ratings, num_similiar=5, num_suggestions=5):
    total_similiarity = np.zeros(len(ratings_data))
    for user_ratings in users_ratings:
        similiarity_scores = ratings_data.dot(user_ratings)
        similiarity_scores = similiarity_scores / norm(user_ratings)
        similiarity_scores = similiarity_scores / norm(ratings_data, axis=1)
        similiarity_scores = 1-similiarity_scores
        similiarity_scores = np.power(similiarity_scores+0.1,-2)
        total_similiarity+=similiarity_scores
    total_similiarity = np.power(total_similiarity,0.5)
    indices = np.argsort(total_similiarity)
    weighted_ratings = diags(total_similiarity, 0)*ratings_data
    sum_ratings = csr_array((len(weighted_ratings[0])))
    for i in np.arange(num_similiar):
        sum_ratings += weighted_ratings[indices[len(indices)-i-1]]
    movie_rankings = np.argsort(sum_ratings.toarray()*-1)
    return movie_rankings[:num_suggestions]


    

 
        
        

construct_ratings_matrix()