import pandas as pd
import numpy as np
from scipy.sparse import csr_array
from scipy.sparse import diags
from scipy.linalg import norm
from similiarity_suggestion import SimUserSuggest

# Create your tests here.

def test_similiarity_suggestion(test_data_loc, num_predict_users):
    sim_user_model = SimUserSuggest("C:/Users/17742/Developer/Comphy/core/ml-25m")
    ratings_df = pd.read_csv(test_data_loc+"/ratings.csv")
    movies_df = pd.read_csv(test_data_loc+"/links.csv")
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

    movies_df = pd.read_csv(test_data_loc+"/links.csv")
    imdb_ids_array = movies_df.loc[:,movies_df.columns[1]].to_numpy()
    indices = movies_df.loc[:,movies_df.columns[0]].to_numpy()
    indices = indices-1
    index_to_imdb = csr_array((imdb_ids_array,(np.zeros(len(indices)),indices)),shape=(1,num_movies)).toarray()[0]
    users_imdb_ids= []
    users_ratings = []
    user_indices = np.array([])
    for i in range(num_predict_users):
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

    
    print(sim_user_model.predict(users_imdb_ids,users_ratings))
    

    

    
test_similiarity_suggestion('C:/Users/17742/Developer/Comphy/core/ml-latest-small', 1)
