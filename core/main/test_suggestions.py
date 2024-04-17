import pandas as pd
import numpy as np
from scipy.sparse import csr_array
from scipy.sparse import diags
from scipy.linalg import norm
from similiarity_suggestion import SimUserSuggest
import matplotlib.pyplot as plt
import time

# Create your tests here.


def create_test_dataset(user_ratings_matrix, group_size = 1, num_tests = 1000, rating_label_rate = 0.5):
    print("full dataset shape: ",user_ratings_matrix.shape)
    total_users = user_ratings_matrix.shape[0]
    total_movies = user_ratings_matrix.shape[1]
    dataset = np.zeros((num_tests,group_size,total_movies))
    labelsset = np.zeros((num_tests,total_movies))
    user_ratings_matrix = user_ratings_matrix.toarray()
    for i in range(num_tests):
        group_dataset = np.zeros((group_size,total_movies))
        group_labels = np.zeros((1,total_movies))
        for j in range(group_size):
            # select rand user
            user_index = int(np.floor(np.random.random()*total_users))
            #print("sampling user: {}".format(user_index))
            user_ratings = user_ratings_matrix[[user_index],:]
            user_ratings= user_ratings / np.abs(user_ratings)
            user_ratings = np.nan_to_num(user_ratings)
            rand_list =  np.random.rand(*user_ratings.shape)
            rating_keep_locs = rand_list<rating_label_rate
            label_locs = rand_list>=rating_label_rate
            user_data = np.multiply(user_ratings,rating_keep_locs)
            labels = np.multiply(user_ratings,label_locs)
            group_dataset[j] = user_data
            group_labels += labels
        
        dataset[i] = group_dataset
        group_labels = np.divide(group_labels,np.abs(group_labels))
        group_labels = np.nan_to_num(group_labels)
        labelsset[i] = group_labels
    print("final dataset shape: ",dataset.shape)
    print("final labels shape: ",labelsset.shape)
    return dataset, labelsset



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

            
def similiarity_suggestion_runtime(test_data_loc, num_samples, max_num_data_users):
    
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
    init_times = []
    num_predict_users = 5
    for num_data_users in range(15000,max_num_data_users,50000):
        sum_time = 0
        init_start_time = time.time()
        sim_user_model = SimUserSuggest(max_user_dataset=num_data_users)
        init_time =  time.time()-init_start_time
        print("num users: {}    initialization time: {}".format(num_data_users,init_time))
        init_times.append(init_time)
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
            #print(suggestions)
            sum_time+= time_elapsed
        times_array.append(sum_time/num_samples)

    num_users_array = np.arange(15000,max_num_data_users,50000)
    plt.plot(num_users_array,times_array,'-k')
    plt.xlabel("Number of Training Samples")
    plt.ylabel("Avg Prediction Time")
    plt.title("Similiarity Suggestion Computation Time")
    plt.show()

    plt.plot(num_users_array,init_times,'-k')
    plt.xlabel("Number of Training Samples")
    plt.ylabel("Initialization Time")
    plt.title("Similiarity Suggestion Initialization Time")
    plt.show()

def similiarity_suggestion_performance(test_data_loc, num_samples, max_num_data_users, num_test_users = 5):
    
    ratings_df = pd.read_csv(test_data_loc+"/ratings.csv")
    movies_df = pd.read_csv(test_data_loc+"/links.csv")

    num_test_movies= movies_df.loc[len(movies_df)-1,movies_df.columns[0]]
    imdb_ids_array = movies_df.loc[:,movies_df.columns[1]].to_numpy()
    indices = movies_df.loc[:,movies_df.columns[0]].to_numpy()
    indices = indices-1
    index_to_imdb = csr_array((imdb_ids_array,(np.zeros(len(indices)),indices)),shape=(1,num_test_movies)).toarray()[0]

    #calc imdb ids for small_dataset
    rating_indices = ratings_df.loc[:,ratings_df.columns[1]].to_numpy()
    rating_indices = rating_indices-1
    movie_imdb_ids = np.take(index_to_imdb,rating_indices)
   


    movies_train_df = pd.read_csv('./ml-25m'+"/links.csv")
    num_movies= movies_train_df.loc[len(movies_train_df)-1,movies_train_df.columns[0]]
    train_imdb_ids_array = movies_train_df.loc[:,movies_train_df.columns[1]].to_numpy()
    train_indices = movies_train_df.loc[:,movies_train_df.columns[0]].to_numpy()
    train_indices = train_indices-1
    imdb_to_train_index = {train_imdb_ids_array[i]: train_indices[i] for i in range(len(train_imdb_ids_array))}

    #calc indices for training matrix
    ratings = ratings_df.loc[:,ratings_df.columns[2]].to_numpy()
    ratings= [ratings[i] for i in np.arange(len(ratings)) if movie_imdb_ids[i] in imdb_to_train_index]
    cols = np.array([imdb_to_train_index[id] for id in movie_imdb_ids if id in imdb_to_train_index])

    
    num_users = ratings_df.loc[len(ratings_df)-1,ratings_df.columns[0]]
    rows = ratings_df.loc[:,ratings_df.columns[0]].to_numpy() #get user id list
    rows = rows-1
    rows= [rows[i] for i in np.arange(len(rows)) if movie_imdb_ids[i] in imdb_to_train_index]



    ratings_matrix = csr_array((ratings, (rows, cols)), shape=(num_users, num_movies))
    print("ratings_matrix shape: ",ratings_matrix.shape)
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


    times_array = []
    init_times = []
    test_dataset, test_labels = create_test_dataset(ratings_matrix,group_size = num_test_users, num_tests = num_samples)
    k_vals = np.arange(1,10,2)
    accuracy_matrix = np.zeros((len(k_vals),len(np.arange(15000,max_num_data_users,50000))))
    index = 0
    for k in k_vals:

        k_accuracies = np.array([])
        for num_data_users in range(15000,max_num_data_users,50000):
            sum_time = 0
            init_start_time = time.time()
            sim_user_model = SimUserSuggest(num_similiar=k,max_user_dataset=num_data_users)
            init_time =  time.time()-init_start_time
            print("num users: {}    initialization time: {}".format(num_data_users,init_time))
            init_times.append(init_time)
            sum_accuracies = 0
            pred_start_time = time.time()
            for sample in range(num_samples):
                lt = time.time()
                curr_data = test_dataset[sample]
                curr_data = csr_array(curr_data)
                curr_labels = test_labels[sample]
                num_tests = np.count_nonzero(curr_labels)
                st = time.time()
                predicted_labels = sim_user_model.predict_ratings(curr_data)
                #print("prediction time = {}".format(time.time()-st))
                test_label_locations = np.abs(curr_labels)
                predicted_test_labels = np.multiply(predicted_labels,test_label_locations)
                num_incorrect = np.sum(np.abs(np.subtract(predicted_test_labels,curr_labels)))/2
                accuracy = (num_tests-num_incorrect)/num_tests
                sum_accuracies +=accuracy
                #print("loop time = {}".format(time.time()-lt))
            k_accuracies = np.append(k_accuracies,[sum_accuracies/num_samples]) 
            total_pred_time = time.time() - pred_start_time
            print("prediction time = {} with {} per prediction".format(total_pred_time, total_pred_time/num_samples))
            print("accuracy = {}".format(sum_accuracies/num_samples))
        accuracy_matrix[index] = k_accuracies
        index +=1
    
    
    num_users_array = np.arange(15000,max_num_data_users,50000)
    rand_accuracies = np.ones(num_users_array.shape)*0.5
    plt.plot(num_users_array,rand_accuracies,'-k', label = 'random labeling')
    plt.xlabel("Number of Training Samples")
    plt.ylabel("Accuracy on Test Data")
    plt.title("Similiarity Suggestion Training Curves\nfor group size = {}".format(num_test_users))
    colors = ['-b', '-c', '-m', '-y','-r']
    for i in range(len(k_vals)):
        plt.plot(num_users_array,accuracy_matrix[i],colors[i],label = 'k-nn: k={}'.format(k_vals[i]))

    plt.legend()
    plt.show()

def similiarity_suggestion_learning(test_data_loc, num_samples, max_test_ratio = 0.8, num_data_users = 200000, num_test_users = 5):
    
    ratings_df = pd.read_csv(test_data_loc+"/ratings.csv")
    movies_df = pd.read_csv(test_data_loc+"/links.csv")

    num_test_movies= movies_df.loc[len(movies_df)-1,movies_df.columns[0]]
    imdb_ids_array = movies_df.loc[:,movies_df.columns[1]].to_numpy()
    indices = movies_df.loc[:,movies_df.columns[0]].to_numpy()
    indices = indices-1
    index_to_imdb = csr_array((imdb_ids_array,(np.zeros(len(indices)),indices)),shape=(1,num_test_movies)).toarray()[0]

    #calc imdb ids for small_dataset
    rating_indices = ratings_df.loc[:,ratings_df.columns[1]].to_numpy()
    rating_indices = rating_indices-1
    movie_imdb_ids = np.take(index_to_imdb,rating_indices)
   


    movies_train_df = pd.read_csv('./ml-25m'+"/links.csv")
    num_movies= movies_train_df.loc[len(movies_train_df)-1,movies_train_df.columns[0]]
    train_imdb_ids_array = movies_train_df.loc[:,movies_train_df.columns[1]].to_numpy()
    train_indices = movies_train_df.loc[:,movies_train_df.columns[0]].to_numpy()
    train_indices = train_indices-1
    imdb_to_train_index = {train_imdb_ids_array[i]: train_indices[i] for i in range(len(train_imdb_ids_array))}

    #calc indices for training matrix
    ratings = ratings_df.loc[:,ratings_df.columns[2]].to_numpy()
    ratings= [ratings[i] for i in np.arange(len(ratings)) if movie_imdb_ids[i] in imdb_to_train_index]
    cols = np.array([imdb_to_train_index[id] for id in movie_imdb_ids if id in imdb_to_train_index])

    
    num_users = ratings_df.loc[len(ratings_df)-1,ratings_df.columns[0]]
    rows = ratings_df.loc[:,ratings_df.columns[0]].to_numpy() #get user id list
    rows = rows-1
    rows= [rows[i] for i in np.arange(len(rows)) if movie_imdb_ids[i] in imdb_to_train_index]



    ratings_matrix = csr_array((ratings, (rows, cols)), shape=(num_users, num_movies))
    print("ratings_matrix shape: ",ratings_matrix.shape)
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


    times_array = []
    init_times = []
    
    k_vals = np.arange(1,10,2)
    accuracy_matrix = np.zeros((len(k_vals),len(np.arange(0.1,max_test_ratio,0.1))))
    index = 0
    num_ratings_matrix = np.zeros((len(k_vals),len(np.arange(0.1,max_test_ratio,0.1))))
    for k in k_vals:
        init_start_time = time.time()
        sim_user_model = SimUserSuggest(num_similiar=k,max_user_dataset=num_data_users)
        init_time =  time.time()-init_start_time
        print("num users: {}    initialization time: {}".format(num_data_users,init_time))
        init_times.append(init_time)

        k_accuracies = np.array([])
        k_num_ratings = np.array([])
        for test_ratio in np.arange(0.1,max_test_ratio,0.1):
            sum_time = 0
            test_dataset, test_labels = create_test_dataset(ratings_matrix,group_size = num_test_users, num_tests = num_samples, rating_label_rate=test_ratio)
            sum_accuracies = 0
            sum_num_ratings =0
            pred_start_time = time.time()
            for sample in range(num_samples):
                lt = time.time()
                curr_data = test_dataset[sample]
                sum_num_ratings += np.count_nonzero(curr_data) / curr_data.shape[0]
                curr_data = csr_array(curr_data)
                curr_labels = test_labels[sample]
                st = time.time()
                predicted_labels = sim_user_model.predict_ratings(curr_data)
                #print("prediction time = {}".format(time.time()-st))
                test_label_locations = np.abs(curr_labels)
                predicted_test_labels = np.multiply(predicted_labels,test_label_locations)
                pred_pos_locations = predicted_test_labels>0.2
                num_predicted_pos = np.sum(pred_pos_locations)
                test_pos_locations = curr_labels>0.2
                num_tp = np.sum(np.multiply(pred_pos_locations,test_pos_locations))
                if num_predicted_pos>0:
                    accuracy = (num_tp)/num_predicted_pos
                    sum_accuracies +=accuracy
                #print("loop time = {}".format(time.time()-lt))
            k_accuracies = np.append(k_accuracies,[sum_accuracies/num_samples]) 
            k_num_ratings = np.append(k_num_ratings,[sum_num_ratings/num_samples])
            total_pred_time = time.time() - pred_start_time
            print("prediction time = {} with {} per prediction".format(total_pred_time, total_pred_time/num_samples))
            print("accuracy = {}".format(sum_accuracies/num_samples))
        accuracy_matrix[index] = k_accuracies
        num_ratings_matrix[index] = k_num_ratings
        index +=1
    
    
    num_users_array = np.arange(0.1,max_test_ratio,0.1)
    rand_accuracies = np.ones(num_users_array.shape)*0.5

    plt.xlabel("Number of Movies Rated by User")
    plt.ylabel("Precision of Predictions")
    plt.title("Similiarity Suggestion Runtime Learning\nfor group size = {},Num Training Samples = {}".format(num_test_users,num_data_users))
    colors = ['-b', '-c', '-m', '-y','-r']
    for i in range(len(k_vals)):
        plt.plot(num_ratings_matrix[i],accuracy_matrix[i],colors[i],label = 'k-nn: k={}'.format(k_vals[i]))

    plt.legend()
    plt.show()

def similiarity_suggestion_users(test_data_loc, num_samples, test_ratio = 0.5, num_data_users = 150000, max_num_test_users = 10):
    
    ratings_df = pd.read_csv(test_data_loc+"/ratings.csv")
    movies_df = pd.read_csv(test_data_loc+"/links.csv")

    num_test_movies= movies_df.loc[len(movies_df)-1,movies_df.columns[0]]
    imdb_ids_array = movies_df.loc[:,movies_df.columns[1]].to_numpy()
    indices = movies_df.loc[:,movies_df.columns[0]].to_numpy()
    indices = indices-1
    index_to_imdb = csr_array((imdb_ids_array,(np.zeros(len(indices)),indices)),shape=(1,num_test_movies)).toarray()[0]

    #calc imdb ids for small_dataset
    rating_indices = ratings_df.loc[:,ratings_df.columns[1]].to_numpy()
    rating_indices = rating_indices-1
    movie_imdb_ids = np.take(index_to_imdb,rating_indices)
   


    movies_train_df = pd.read_csv('./ml-25m'+"/links.csv")
    num_movies= movies_train_df.loc[len(movies_train_df)-1,movies_train_df.columns[0]]
    train_imdb_ids_array = movies_train_df.loc[:,movies_train_df.columns[1]].to_numpy()
    train_indices = movies_train_df.loc[:,movies_train_df.columns[0]].to_numpy()
    train_indices = train_indices-1
    imdb_to_train_index = {train_imdb_ids_array[i]: train_indices[i] for i in range(len(train_imdb_ids_array))}

    #calc indices for training matrix
    ratings = ratings_df.loc[:,ratings_df.columns[2]].to_numpy()
    ratings= [ratings[i] for i in np.arange(len(ratings)) if movie_imdb_ids[i] in imdb_to_train_index]
    cols = np.array([imdb_to_train_index[id] for id in movie_imdb_ids if id in imdb_to_train_index])

    
    num_users = ratings_df.loc[len(ratings_df)-1,ratings_df.columns[0]]
    rows = ratings_df.loc[:,ratings_df.columns[0]].to_numpy() #get user id list
    rows = rows-1
    rows= [rows[i] for i in np.arange(len(rows)) if movie_imdb_ids[i] in imdb_to_train_index]



    ratings_matrix = csr_array((ratings, (rows, cols)), shape=(num_users, num_movies))
    print("ratings_matrix shape: ",ratings_matrix.shape)
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


    times_array = []
    init_times = []
    
    k_vals = np.arange(1,10,2)
    accuracy_matrix = np.zeros((len(k_vals),len(np.arange(1,max_num_test_users))))
    index = 0
    num_ratings_matrix = np.zeros((len(k_vals),len(np.arange(1,max_num_test_users))))
    for k in k_vals:
        init_start_time = time.time()
        sim_user_model = SimUserSuggest(num_similiar=k,max_user_dataset=num_data_users)
        init_time =  time.time()-init_start_time
        print("num users: {}    initialization time: {}".format(num_data_users,init_time))
        init_times.append(init_time)

        k_accuracies = np.array([])
        k_num_ratings = np.array([])
        for num_test_users in np.arange(1,max_num_test_users):
            sum_time = 0
            test_dataset, test_labels = create_test_dataset(ratings_matrix,group_size = num_test_users, num_tests = num_samples, rating_label_rate=test_ratio)
            sum_accuracies = 0
            sum_num_ratings =0
            pred_start_time = time.time()
            for sample in range(num_samples):
                lt = time.time()
                curr_data = test_dataset[sample]
                sum_num_ratings += np.count_nonzero(curr_data) / curr_data.shape[0]
                curr_data = csr_array(curr_data)
                curr_labels = test_labels[sample]
                num_tests = np.count_nonzero(curr_labels)
                st = time.time()
                predicted_labels = sim_user_model.predict_ratings(curr_data)
                #print("prediction time = {}".format(time.time()-st))
                test_label_locations = np.abs(curr_labels)
                predicted_test_labels = np.multiply(predicted_labels,test_label_locations)
                num_incorrect = np.sum(np.abs(np.subtract(predicted_test_labels,curr_labels)))/2
                accuracy = (num_tests-num_incorrect)/num_tests
                sum_accuracies +=accuracy
                #print("loop time = {}".format(time.time()-lt))
            k_accuracies = np.append(k_accuracies,[sum_accuracies/num_samples]) 
            k_num_ratings = np.append(k_num_ratings,[sum_num_ratings/num_samples])
            total_pred_time = time.time() - pred_start_time
            print("prediction time = {} with {} per prediction".format(total_pred_time, total_pred_time/num_samples))
            print("accuracy = {}".format(sum_accuracies/num_samples))
        accuracy_matrix[index] = k_accuracies
        num_ratings_matrix[index] = k_num_ratings
        index +=1
    
    
    group_size_array = np.arange(1,max_num_test_users)

    plt.xlabel("Number of Movies Rated by User")
    plt.ylabel("Accuracy of Predictions")
    plt.title("Similiarity Suggestion Training Curves\nfor Number of Training Samples = {}".format(num_data_users))
    colors = ['-b', '-c', '-m', '-y','-r']
    for i in range(len(k_vals)):
        plt.plot(group_size_array,accuracy_matrix[i],colors[i],label = 'k-nn: k={}'.format(k_vals[i]))

    plt.legend()
    plt.show()
#similiarity_suggestion_performance("C:/Users/17742/Developer/Comphy/core/ml-latest-small", 100,375000)

similiarity_suggestion_learning("C:/Users/17742/Developer/Comphy/core/ml-latest-small", 100)

#similiarity_suggestion_users("C:/Users/17742/Developer/Comphy/core/ml-latest-small", 100)
    
#similiarity_suggestion_runtime("C:/Users/17742/Developer/Comphy/core/ml-latest-small", 100,375000)


