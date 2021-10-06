# AdapterHub Playground

Using the newest Natural Language Processing tools made easy with the AdapterHub Playground.

**Predict, Train and Cluster** your data without any coding knowledge based on the latest models provided by [AdapterHub](https://adapterhub.ml/).

Visit **https://adapter-hub.github.io/playground** to get started with the AH Playground.


## Architecture

![](architecture_v3_latex.svg)

-   **Frontend** - Interface to the User: provides a visual interface for creating/editing/deleting of projects and creating/deleting their actions
-   **Backend** - Provides the BackendAPI for the frontend to maintain projects and actions. The projects and actions are stored in the SQL Database. The backend also generates the code based on the provided action configuration from the frontend. The code execution is either done using the KaggleAPI on Kaggle or locally on the machine.
-   **Google Sheets** - Provides the data in form of a table: input for prediction and gold labels for training.
-   **Kaggle (optional)** - Provides the KaggleAPI and enables remote python code execution on foreign computation resources provided by Kaggle.

## Frontend

The "master" branch contains the frontend. Use `npm install` and `npm run start` develop/host it locally.

## Backend

The "backend" branch of this repository contains the backend code.  
It is build using NodeJS and requires python and some additional packages to execute code locally.  
We provide a dockerfile that runs the backend without any additional setup (including the database).  
To run this docker instance execute the following commands:

```
docker build https://raw.githubusercontent.com/Adapter-Hub/playground/backend/Dockerfile -t ah_playground
docker run -d -p 4000:4000 ah_playground
```

Contact person: [Tilman Beck](mailto:beck@ukp.informatik.tu-darmstadt.de)

https://www.ukp.tu-darmstadt.de/


Don't hesitate to send us an e-mail or report an issue, if something is broken (and it shouldn't be) or if you have further questions.

> This repository contains experimental software and is published for the sole purpose of giving additional background details on the respective publication.

## Citation

Our paper: [AdapterHub: A Framework for Adapting Transformers](https://arxiv.org/abs/2007.07779)

```
@misc{beck2021adapterhub,
      title={AdapterHub Playground: Simple and Flexible Few-Shot Learning with Adapters}, 
      author={Tilman Beck and Bela Bohlender and Christina Viehmann and Vincent Hane and Yanik Adamson and Jaber Khuri and Jonas Brossmann and Jonas Pfeiffer and Iryna Gurevych},
      year={2021},
      eprint={2108.08103},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```