import { ClusteringTaskMethod, ClusteringTaskRepresentation, NewClusteringTaskInput, Project } from "../entities"
import * as setup from "./setup"
import * as IOHandling from "./IO-handling"
import { InputType } from "./utils"

export function generateClusteringCode({ method, nClusters, representation, sheetsColumnName, name }: NewClusteringTaskInput, sheetsDocumentURL: string, sheetsAccessToken: string) {
    return `
import os
os.system('pip install sentence_transformers')
os.system('pip install gspread oauth2client')
import numpy as np

${setup.genImportSheetConnectionPackages()}
${IOHandling.genInitializeSheetConnection(sheetsDocumentURL, sheetsAccessToken)}
${IOHandling.genReadInputFromSheet(InputType.OneInputClassification)}

from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.feature_extraction.text import TfidfVectorizer
from sentence_transformers import SentenceTransformer

texts = user_input_data_1

# user parameters
n_clusters = ${nClusters} # must be 0 < n_clusters < n_data, must be int
representation = '${ClusteringTaskRepresentation[representation]}' # options: ['tfidf', 'sbert']
method = '${ClusteringTaskMethod[method]}' # options: ['kmeans', 'agglomerative']

# encode texts
if representation == 'tfidf':
    vectorizer = TfidfVectorizer()
    encodings = vectorizer.fit_transform(texts).todense()
elif representation == 'sbert':
    vectorizer = SentenceTransformer('distilbert-base-nli-mean-tokens')
    encodings = vectorizer.encode(texts)
else:
    # fallback is tf-idf
    vectorizer = TfidfVectorizer()
    encodings = vectorizer.fit_transform(texts).todense()

# perform clustering
if method == 'kmeans':
    clusterer = KMeans(n_clusters=n_clusters, init='k-means++', max_iter=100)
    clusterer.fit(encodings)
elif method == 'agglomerative':
    clusterer = AgglomerativeClustering(n_clusters=n_clusters, affinity='cosine',linkage='average')
    clusterer.fit(encodings)

labels = clusterer.labels_ # len(labels) == len(texts) and label at labels[i] is the label for text at texts[i]
list_to_write_in_sheets_result_column = np.concatenate([[['${name}']], np.array(labels).reshape((-1, 1))], axis=0).tolist()
${IOHandling.genWriteOutputInSheet(sheetsColumnName)}`
}
