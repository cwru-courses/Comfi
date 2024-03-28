import numpy as np
from sklearn.linear_model import SGDClassifier

class lr_suggestion_model():

    def __init__(self, numberOfUsers):
        user_logregs = []
        for i in range(numberOfUsers):
            user_logregs.append( SGDClassifier(loss='log_loss', warm_start = True))
        self.users = user_logregs
        self.num_users = numberOfUsers

    def update_classifiers(self, users_data, users_labels):
        for i in range(self.num_users):
            self.users[i].fit(users_data[i], users_labels[i])
    
    def suggest(self, movie_data, num_suggest = -1):
        movie_probs = np.zeros((len(movie_data)))
        for logreg in self.users:
            movie_probs += logreg.predict_log_proba(movie_data)
        
        movie_probs *=-1
        new_indices = np.argsort(movie_probs)
        ranked_movies = np.take(movie_data,new_indices,axis=0)
        if(num_suggest<0):
            return ranked_movies
        return ranked_movies[0:num_suggest,:]
