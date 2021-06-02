import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export enum ClusteringTaskMethod {
  Kmeans = 'kmeans',
  Agglomerative = 'agglomerative'
}

export enum ClusteringTaskRepresentation {
  Tfidf = 'tfidf',
  Sbert = 'sbert'
}

export type File = {
  __typename?: 'File';
  name: Scalars['String'];
  url: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addProject: Project;
  deleteProject: Scalars['Boolean'];
  addClusteringTask: Task;
  addTrainingTask: Task;
  addPredictionTask: Task;
  deleteTask: Scalars['Boolean'];
};


export type MutationAddProjectArgs = {
  input: NewProjectInput;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['Int'];
};


export type MutationAddClusteringTaskArgs = {
  input: NewClusteringTaskInput;
};


export type MutationAddTrainingTaskArgs = {
  input: NewTrainingTaskInput;
};


export type MutationAddPredictionTaskArgs = {
  input: NewPredictionTaskInput;
};


export type MutationDeleteTaskArgs = {
  id: Scalars['Int'];
};

export type NewClusteringTaskInput = {
  name: Scalars['String'];
  projectId: Scalars['Int'];
  sheetsColumnName: Scalars['String'];
  nClusters: Scalars['Float'];
  representation: ClusteringTaskRepresentation;
  method: ClusteringTaskMethod;
};

export type NewPredictionTaskInput = {
  name: Scalars['String'];
  projectId: Scalars['Int'];
  trainingDataset: Scalars['String'];
  taskType: Scalars['String'];
  modelTransformerClass: Scalars['String'];
  modelName: Scalars['String'];
  adapterArchitecture?: Maybe<Scalars['String']>;
  adapterGroupName?: Maybe<Scalars['String']>;
  nlpTaskType?: Maybe<Scalars['String']>;
  file?: Maybe<Scalars['Upload']>;
  sheetsColumnName: Scalars['String'];
};

export type NewProjectInput = {
  name: Scalars['String'];
  googleSheetId: Scalars['String'];
};

export type NewTrainingTaskInput = {
  name: Scalars['String'];
  projectId: Scalars['Int'];
  trainingDataset: Scalars['String'];
  taskType: Scalars['String'];
  modelTransformerClass: Scalars['String'];
  modelName: Scalars['String'];
  adapterArchitecture?: Maybe<Scalars['String']>;
  adapterGroupName?: Maybe<Scalars['String']>;
  nlpTaskType?: Maybe<Scalars['String']>;
  file?: Maybe<Scalars['Upload']>;
  learningRate: Scalars['Float'];
  numTrainEpochs: Scalars['Float'];
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['Int'];
  name: Scalars['String'];
  googleSheetId: Scalars['String'];
  tasks: Array<Task>;
  taskIds: Array<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  getProjects: Array<Project>;
  getProject: Project;
  getTask: Task;
  checkAuthentication: Scalars['Boolean'];
};


export type QueryGetProjectArgs = {
  id: Scalars['Int'];
};


export type QueryGetTaskArgs = {
  id: Scalars['Int'];
};

export type Task = {
  __typename?: 'Task';
  id: Scalars['Int'];
  name: Scalars['String'];
  type: TaskType;
  status?: Maybe<TaskStatus>;
  log?: Maybe<Scalars['String']>;
  projectId: Scalars['Int'];
  project: Project;
  kernelId?: Maybe<Scalars['String']>;
  output?: Maybe<TaskOutput>;
};

export type TaskOutput = {
  __typename?: 'TaskOutput';
  log: Scalars['String'];
  files: Array<File>;
  accuracy: Scalars['Float'];
  f1: Scalars['Float'];
};

export enum TaskStatus {
  Running = 'Running',
  Queued = 'Queued',
  Complete = 'Complete',
  Error = 'Error'
}

export enum TaskType {
  Prediction = 'Prediction',
  Training = 'Training',
  Clustering = 'Clustering'
}


export type ProjectOverviewFragment = (
  { __typename?: 'Project' }
  & Pick<Project, 'id' | 'name' | 'googleSheetId'>
);

export type ProjectFragment = (
  { __typename?: 'Project' }
  & { tasks: Array<(
    { __typename?: 'Task' }
    & Pick<Task, 'id'>
  )> }
  & ProjectOverviewFragment
);

export type GetProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetProjectsQuery = (
  { __typename?: 'Query' }
  & { getProjects: Array<(
    { __typename?: 'Project' }
    & ProjectOverviewFragment
  )> }
);

export type GetProjectQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetProjectQuery = (
  { __typename?: 'Query' }
  & { getProject: (
    { __typename?: 'Project' }
    & ProjectFragment
  ) }
);

export type AddProjectMutationVariables = Exact<{
  input: NewProjectInput;
}>;


export type AddProjectMutation = (
  { __typename?: 'Mutation' }
  & { addProject: (
    { __typename?: 'Project' }
    & ProjectOverviewFragment
  ) }
);

export type DeleteProjectMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteProjectMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteProject'>
);

export type TaskFragment = (
  { __typename?: 'Task' }
  & Pick<Task, 'id' | 'name' | 'type' | 'status'>
  & { output?: Maybe<(
    { __typename?: 'TaskOutput' }
    & Pick<TaskOutput, 'f1' | 'accuracy' | 'log'>
    & { files: Array<(
      { __typename?: 'File' }
      & Pick<File, 'name' | 'url'>
    )> }
  )> }
);

export type GetTaskQueryVariables = Exact<{
  id: Scalars['Int'];
}>;


export type GetTaskQuery = (
  { __typename?: 'Query' }
  & { getTask: (
    { __typename?: 'Task' }
    & TaskFragment
  ) }
);

export type AddClusteringTaskMutationVariables = Exact<{
  input: NewClusteringTaskInput;
}>;


export type AddClusteringTaskMutation = (
  { __typename?: 'Mutation' }
  & { addClusteringTask: (
    { __typename?: 'Task' }
    & Pick<Task, 'name'>
  ) }
);

export type AddTrainingTaskMutationVariables = Exact<{
  input: NewTrainingTaskInput;
}>;


export type AddTrainingTaskMutation = (
  { __typename?: 'Mutation' }
  & { addTrainingTask: (
    { __typename?: 'Task' }
    & Pick<Task, 'name'>
  ) }
);

export type AddPredictionTaskMutationVariables = Exact<{
  input: NewPredictionTaskInput;
}>;


export type AddPredictionTaskMutation = (
  { __typename?: 'Mutation' }
  & { addPredictionTask: (
    { __typename?: 'Task' }
    & Pick<Task, 'name'>
  ) }
);

export type DeleteTaskMutationVariables = Exact<{
  id: Scalars['Int'];
}>;


export type DeleteTaskMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'deleteTask'>
);

export type CheckAutenticationQueryVariables = Exact<{ [key: string]: never; }>;


export type CheckAutenticationQuery = (
  { __typename?: 'Query' }
  & Pick<Query, 'checkAuthentication'>
);

export const ProjectOverviewFragmentDoc = gql`
    fragment ProjectOverview on Project {
  id
  name
  googleSheetId
}
    `;
export const ProjectFragmentDoc = gql`
    fragment Project on Project {
  ...ProjectOverview
  tasks {
    id
  }
}
    ${ProjectOverviewFragmentDoc}`;
export const TaskFragmentDoc = gql`
    fragment Task on Task {
  id
  name
  type
  status
  output {
    f1
    accuracy
    log
    files {
      name
      url
    }
  }
}
    `;
export const GetProjectsDocument = gql`
    query GetProjects {
  getProjects {
    ...ProjectOverview
  }
}
    ${ProjectOverviewFragmentDoc}`;

/**
 * __useGetProjectsQuery__
 *
 * To run a query within a React component, call `useGetProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetProjectsQuery(baseOptions?: Apollo.QueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
      }
export function useGetProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectsQuery, GetProjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectsQuery, GetProjectsQueryVariables>(GetProjectsDocument, options);
        }
export type GetProjectsQueryHookResult = ReturnType<typeof useGetProjectsQuery>;
export type GetProjectsLazyQueryHookResult = ReturnType<typeof useGetProjectsLazyQuery>;
export type GetProjectsQueryResult = Apollo.QueryResult<GetProjectsQuery, GetProjectsQueryVariables>;
export const GetProjectDocument = gql`
    query GetProject($id: Int!) {
  getProject(id: $id) {
    ...Project
  }
}
    ${ProjectFragmentDoc}`;

/**
 * __useGetProjectQuery__
 *
 * To run a query within a React component, call `useGetProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetProjectQuery(baseOptions: Apollo.QueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, options);
      }
export function useGetProjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectQuery, GetProjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectQuery, GetProjectQueryVariables>(GetProjectDocument, options);
        }
export type GetProjectQueryHookResult = ReturnType<typeof useGetProjectQuery>;
export type GetProjectLazyQueryHookResult = ReturnType<typeof useGetProjectLazyQuery>;
export type GetProjectQueryResult = Apollo.QueryResult<GetProjectQuery, GetProjectQueryVariables>;
export const AddProjectDocument = gql`
    mutation AddProject($input: NewProjectInput!) {
  addProject(input: $input) {
    ...ProjectOverview
  }
}
    ${ProjectOverviewFragmentDoc}`;
export type AddProjectMutationFn = Apollo.MutationFunction<AddProjectMutation, AddProjectMutationVariables>;

/**
 * __useAddProjectMutation__
 *
 * To run a mutation, you first call `useAddProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addProjectMutation, { data, loading, error }] = useAddProjectMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddProjectMutation(baseOptions?: Apollo.MutationHookOptions<AddProjectMutation, AddProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddProjectMutation, AddProjectMutationVariables>(AddProjectDocument, options);
      }
export type AddProjectMutationHookResult = ReturnType<typeof useAddProjectMutation>;
export type AddProjectMutationResult = Apollo.MutationResult<AddProjectMutation>;
export type AddProjectMutationOptions = Apollo.BaseMutationOptions<AddProjectMutation, AddProjectMutationVariables>;
export const DeleteProjectDocument = gql`
    mutation DeleteProject($id: Int!) {
  deleteProject(id: $id)
}
    `;
export type DeleteProjectMutationFn = Apollo.MutationFunction<DeleteProjectMutation, DeleteProjectMutationVariables>;

/**
 * __useDeleteProjectMutation__
 *
 * To run a mutation, you first call `useDeleteProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProjectMutation, { data, loading, error }] = useDeleteProjectMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteProjectMutation(baseOptions?: Apollo.MutationHookOptions<DeleteProjectMutation, DeleteProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteProjectMutation, DeleteProjectMutationVariables>(DeleteProjectDocument, options);
      }
export type DeleteProjectMutationHookResult = ReturnType<typeof useDeleteProjectMutation>;
export type DeleteProjectMutationResult = Apollo.MutationResult<DeleteProjectMutation>;
export type DeleteProjectMutationOptions = Apollo.BaseMutationOptions<DeleteProjectMutation, DeleteProjectMutationVariables>;
export const GetTaskDocument = gql`
    query GetTask($id: Int!) {
  getTask(id: $id) {
    ...Task
  }
}
    ${TaskFragmentDoc}`;

/**
 * __useGetTaskQuery__
 *
 * To run a query within a React component, call `useGetTaskQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTaskQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTaskQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTaskQuery(baseOptions: Apollo.QueryHookOptions<GetTaskQuery, GetTaskQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTaskQuery, GetTaskQueryVariables>(GetTaskDocument, options);
      }
export function useGetTaskLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTaskQuery, GetTaskQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTaskQuery, GetTaskQueryVariables>(GetTaskDocument, options);
        }
export type GetTaskQueryHookResult = ReturnType<typeof useGetTaskQuery>;
export type GetTaskLazyQueryHookResult = ReturnType<typeof useGetTaskLazyQuery>;
export type GetTaskQueryResult = Apollo.QueryResult<GetTaskQuery, GetTaskQueryVariables>;
export const AddClusteringTaskDocument = gql`
    mutation AddClusteringTask($input: NewClusteringTaskInput!) {
  addClusteringTask(input: $input) {
    name
  }
}
    `;
export type AddClusteringTaskMutationFn = Apollo.MutationFunction<AddClusteringTaskMutation, AddClusteringTaskMutationVariables>;

/**
 * __useAddClusteringTaskMutation__
 *
 * To run a mutation, you first call `useAddClusteringTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddClusteringTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addClusteringTaskMutation, { data, loading, error }] = useAddClusteringTaskMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddClusteringTaskMutation(baseOptions?: Apollo.MutationHookOptions<AddClusteringTaskMutation, AddClusteringTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddClusteringTaskMutation, AddClusteringTaskMutationVariables>(AddClusteringTaskDocument, options);
      }
export type AddClusteringTaskMutationHookResult = ReturnType<typeof useAddClusteringTaskMutation>;
export type AddClusteringTaskMutationResult = Apollo.MutationResult<AddClusteringTaskMutation>;
export type AddClusteringTaskMutationOptions = Apollo.BaseMutationOptions<AddClusteringTaskMutation, AddClusteringTaskMutationVariables>;
export const AddTrainingTaskDocument = gql`
    mutation AddTrainingTask($input: NewTrainingTaskInput!) {
  addTrainingTask(input: $input) {
    name
  }
}
    `;
export type AddTrainingTaskMutationFn = Apollo.MutationFunction<AddTrainingTaskMutation, AddTrainingTaskMutationVariables>;

/**
 * __useAddTrainingTaskMutation__
 *
 * To run a mutation, you first call `useAddTrainingTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddTrainingTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addTrainingTaskMutation, { data, loading, error }] = useAddTrainingTaskMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddTrainingTaskMutation(baseOptions?: Apollo.MutationHookOptions<AddTrainingTaskMutation, AddTrainingTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddTrainingTaskMutation, AddTrainingTaskMutationVariables>(AddTrainingTaskDocument, options);
      }
export type AddTrainingTaskMutationHookResult = ReturnType<typeof useAddTrainingTaskMutation>;
export type AddTrainingTaskMutationResult = Apollo.MutationResult<AddTrainingTaskMutation>;
export type AddTrainingTaskMutationOptions = Apollo.BaseMutationOptions<AddTrainingTaskMutation, AddTrainingTaskMutationVariables>;
export const AddPredictionTaskDocument = gql`
    mutation AddPredictionTask($input: NewPredictionTaskInput!) {
  addPredictionTask(input: $input) {
    name
  }
}
    `;
export type AddPredictionTaskMutationFn = Apollo.MutationFunction<AddPredictionTaskMutation, AddPredictionTaskMutationVariables>;

/**
 * __useAddPredictionTaskMutation__
 *
 * To run a mutation, you first call `useAddPredictionTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPredictionTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPredictionTaskMutation, { data, loading, error }] = useAddPredictionTaskMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddPredictionTaskMutation(baseOptions?: Apollo.MutationHookOptions<AddPredictionTaskMutation, AddPredictionTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddPredictionTaskMutation, AddPredictionTaskMutationVariables>(AddPredictionTaskDocument, options);
      }
export type AddPredictionTaskMutationHookResult = ReturnType<typeof useAddPredictionTaskMutation>;
export type AddPredictionTaskMutationResult = Apollo.MutationResult<AddPredictionTaskMutation>;
export type AddPredictionTaskMutationOptions = Apollo.BaseMutationOptions<AddPredictionTaskMutation, AddPredictionTaskMutationVariables>;
export const DeleteTaskDocument = gql`
    mutation DeleteTask($id: Int!) {
  deleteTask(id: $id)
}
    `;
export type DeleteTaskMutationFn = Apollo.MutationFunction<DeleteTaskMutation, DeleteTaskMutationVariables>;

/**
 * __useDeleteTaskMutation__
 *
 * To run a mutation, you first call `useDeleteTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTaskMutation, { data, loading, error }] = useDeleteTaskMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTaskMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTaskMutation, DeleteTaskMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTaskMutation, DeleteTaskMutationVariables>(DeleteTaskDocument, options);
      }
export type DeleteTaskMutationHookResult = ReturnType<typeof useDeleteTaskMutation>;
export type DeleteTaskMutationResult = Apollo.MutationResult<DeleteTaskMutation>;
export type DeleteTaskMutationOptions = Apollo.BaseMutationOptions<DeleteTaskMutation, DeleteTaskMutationVariables>;
export const CheckAutenticationDocument = gql`
    query CheckAutentication {
  checkAuthentication
}
    `;

/**
 * __useCheckAutenticationQuery__
 *
 * To run a query within a React component, call `useCheckAutenticationQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckAutenticationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckAutenticationQuery({
 *   variables: {
 *   },
 * });
 */
export function useCheckAutenticationQuery(baseOptions?: Apollo.QueryHookOptions<CheckAutenticationQuery, CheckAutenticationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckAutenticationQuery, CheckAutenticationQueryVariables>(CheckAutenticationDocument, options);
      }
export function useCheckAutenticationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckAutenticationQuery, CheckAutenticationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckAutenticationQuery, CheckAutenticationQueryVariables>(CheckAutenticationDocument, options);
        }
export type CheckAutenticationQueryHookResult = ReturnType<typeof useCheckAutenticationQuery>;
export type CheckAutenticationLazyQueryHookResult = ReturnType<typeof useCheckAutenticationLazyQuery>;
export type CheckAutenticationQueryResult = Apollo.QueryResult<CheckAutenticationQuery, CheckAutenticationQueryVariables>;