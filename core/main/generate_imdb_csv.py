import pandas as pd
import numpy as np

def generate_dataset_from_imdb(path, save_path):
    df = pd.read_csv(path,sep='\t')
    print(df.columns)
    df = df.loc[df['titleType'].isin(['movie'])]
    df = df.loc[df['isAdult']==0]
    df = df.loc[df['startYear']>1950]
    df = df.loc[df['runtimeMinutes']>35]
    df.drop(['primaryTitle','originalTitle','isAdult','endYear'],axis=1)
    df = pd.get_dummies(df[['gen']],drop_first=True)

generate_dataset_from_imdb('./data.tsv','./filtered_data.csv')