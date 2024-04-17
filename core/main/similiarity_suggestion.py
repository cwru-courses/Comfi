import numpy as np
import pandas as pd
from scipy.sparse import csr_array
from scipy.sparse import diags
from scipy.linalg import norm

data_folder_location = "./ml-25m"

class SimUserSuggest():
    def __init__(self, num_similiar=7,max_user_dataset = 100000):
        ratings_df = pd.read_csv(data_folder_location+"/ratings.csv")
        movies_df = pd.read_csv(data_folder_location+"/links.csv")
        num_movies= movies_df.loc[len(movies_df)-1,movies_df.columns[0]]
        self.num_movies = num_movies
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
        self.movie_num_ratings = data_locations.sum(axis=0)
        index = np.arange(np.shape(ratings_matrix)[0])
        np.random.shuffle(index)
        ratings_matrix = ratings_matrix[index, :]
        num_users = min(max_user_dataset,num_users)
        self.num_users = num_users
        ratings_matrix = ratings_matrix[:num_users,:]
        self.ratings = ratings_matrix
        
        imdb_ids_array = movies_df.loc[:,movies_df.columns[1]].to_numpy()
        indices = movies_df.loc[:,movies_df.columns[0]].to_numpy()
        indices = indices-1
        self.index_to_imdb = csr_array((imdb_ids_array,(np.zeros((len(indices))),indices)),shape=(1,num_movies)).toarray()[0]
        self.num_similiar = num_similiar
        print("num_sim ", self.num_similiar)
        self.imdb_to_index = {imdb_ids_array[i]: indices[i] for i in range(len(imdb_ids_array))}
        self.num_movies = num_movies
        self.ratings_norms = np.transpose(np.array([[norm(ratings_matrix[[i],:].toarray()) for i in np.arange(num_users)]]))
        #print(np.where(self.ratings_norms==0)[0])

    def default_prediction(self, num_predictions = 5):
        print("default pred num movies: ",self.movie_num_ratings.shape)
        movie_index_suggestions = np.argsort(-1*self.movie_num_ratings)[:num_predictions]
        return np.array([self.index_to_imdb[index] for index in movie_index_suggestions])
    
    def predict(self,users_imdb_ids, users_ratings, num_predictions=5 ):
        data = users_ratings[0]
        data = data-np.mean(data)
        data = [data[i] for i in np.arange(len(data)) if users_imdb_ids[0][i] in self.imdb_to_index]
        cols = np.array([self.imdb_to_index[id] for id in users_imdb_ids[0] if id in self.imdb_to_index])
        rows = np.ones((len(cols)))*0
        has_been_rated = np.zeros((self.num_movies))
        for movie in cols:
            has_been_rated[movie] = 1
        for i in np.arange(1,len(users_ratings)):
            curr_ratings = users_ratings[i]
            curr_ratings = curr_ratings-np.mean(curr_ratings)
            curr_ratings = [curr_ratings[j] for j in np.arange(len(curr_ratings)) if users_imdb_ids[i][j] in self.imdb_to_index]
            data = np.append(data,curr_ratings) 
            new_cols = np.array([self.imdb_to_index[id] for id in users_imdb_ids[i] if id in self.imdb_to_index])
            rows = np.append(rows,np.ones((len(new_cols)))*i)
            cols = np.append(cols,new_cols)
            user_been_rated = np.zeros((self.num_movies))
            for movie in new_cols:
                user_been_rated[movie] = 1
            has_been_rated = np.multiply(has_been_rated,user_been_rated)
        users_sparse = csr_array( (data,(rows,cols)),shape=(len(users_ratings),self.num_movies))
        
        return  self.suggest_movies(users_sparse, has_been_rated,num_suggestions = num_predictions)
    
    
        
        

    def suggest_movies(self, users_ratings, users_have_rated, num_suggestions=5):
        total_similiarity = np.zeros(self.num_users)
        for user_ratings in users_ratings:
            user_ratings = user_ratings.toarray()
            similiarity_scores = self.ratings.dot(user_ratings.transpose())
            similiarity_scores = similiarity_scores / norm(user_ratings)
            similiarity_scores = similiarity_scores / self.ratings_norms
            similiarity_scores = np.nan_to_num(similiarity_scores)
            similiarity_scores = 1-similiarity_scores
            similiarity_scores = np.power(similiarity_scores+0.001,-2)
            total_similiarity+=np.transpose(similiarity_scores)[0]
        total_similiarity = np.power(total_similiarity,0.5)
        indices = np.argsort(total_similiarity)
        weighted_ratings = diags(total_similiarity, 0)*self.ratings
        sum_ratings = np.zeros((self.num_movies))
        for i in np.arange(self.num_similiar):
            #print("sampling from user ",indices[len(indices)-i-1])
            sum_ratings += weighted_ratings[[indices[len(indices)-i-1]],:].toarray()[0]
        sum_ratings = sum_ratings
        #print(sum_ratings)
        movie_rankings = np.argsort(sum_ratings*-1)
        num_selected = 0
        best_imdb_ids = np.zeros((num_suggestions))
        index=0

        while num_selected < num_suggestions:
            curr_movie = movie_rankings[index] 

            if users_have_rated[curr_movie] == 0:
                best_imdb_ids[num_selected] = self.index_to_imdb[curr_movie]
                num_selected+=1
            index+=1
        return best_imdb_ids
    
    def predict_ratings(self, users_ratings):
        total_similiarity = np.zeros(self.num_users)
        for user_ratings in users_ratings:
            user_ratings = user_ratings.toarray()
            similiarity_scores = self.ratings.dot(user_ratings.transpose())
            similiarity_scores = similiarity_scores / norm(user_ratings)
            similiarity_scores = similiarity_scores / self.ratings_norms
            similiarity_scores = np.nan_to_num(similiarity_scores)
            similiarity_scores = 1-similiarity_scores
            similiarity_scores = np.power(similiarity_scores+0.001,-2)
            total_similiarity+=np.transpose(similiarity_scores)[0]
        total_similiarity = np.power(total_similiarity,0.5)
        indices = np.argsort(total_similiarity)
        weighted_ratings = diags(total_similiarity, 0)*self.ratings
        sum_ratings = np.zeros((self.num_movies))
        for i in np.arange(self.num_similiar):
            #print("sampling from user ",indices[len(indices)-i-1])
            sum_ratings += weighted_ratings[[indices[len(indices)-i-1]],:].toarray()[0]
        sum_ratings = np.divide(sum_ratings,np.abs(sum_ratings))
        sum_ratings = np.nan_to_num(sum_ratings)
        return sum_ratings
