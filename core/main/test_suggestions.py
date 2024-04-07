import pandas as pd
import numpy as np
from scipy.sparse import csr_array
from scipy.sparse import diags
from scipy.linalg import norm
from similiarity_suggestion import SimUserSuggest
import matplotlib.pyplot as plt
import time

# Create your tests here.

def test_similiarity_suggestion(test_data_loc, num_samples, max_num_pred_users):
    sim_user_model = SimUserSuggest()
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
    times_array = []
    for num_predict_users in range(1,max_num_pred_users+1):
        sum_time = 0
        for sample in range(num_samples):
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

            start_time = time.time()
            suggestions = sim_user_model.predict(users_imdb_ids,users_ratings)
            time_elapsed = time.time()- start_time
            print("num users: {}    computation time: {}".format(num_predict_users,time_elapsed))
            print(suggestions)
            sum_time+= time_elapsed
        times_array.append(sum_time/num_samples)

    num_users_array = np.arange(1,max_num_pred_users+1)
    plt.plot(num_users_array,times_array,'-k')
    plt.xlabel("num_users")
    plt.ylabel("avg comp time")
    plt.title("Similiarity Suggestion Computation Time\nwhere num Dataset users = {}".format(sim_user_model.num_users))
    plt.show()

            
def test_similiarity_suggestion_dataset(test_data_loc, num_samples, max_num_data_users):
    
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
    times_array = []

    num_predict_users = 5
    for num_data_users in range(15000,max_num_data_users,100000):
        sum_time = 0

        sim_user_model = SimUserSuggest(max_user_dataset=num_data_users)
        for sample in range(num_samples):
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

            start_time = time.time()
            suggestions = sim_user_model.predict(users_imdb_ids,users_ratings)
            time_elapsed = time.time()- start_time
            print("num users: {}    computation time: {}".format(num_data_users,time_elapsed))
            print(suggestions)
            sum_time+= time_elapsed
        times_array.append(sum_time/num_samples)

    num_users_array = np.arange(15000,max_num_data_users,100000)
    plt.plot(num_users_array,times_array,'-k')
    plt.xlabel("num dataset users")
    plt.ylabel("avg comp time")
    plt.title("Similiarity Suggestion Computation Time\nwhere num users in group = {}".format(5))
    plt.show()

    
test_similiarity_suggestion("C:/Users/17742/Developer/Comphy/core/ml-latest-small", 20,10)
    
test_similiarity_suggestion_dataset("C:/Users/17742/Developer/Comphy/core/ml-latest-small", 20,1000000)
