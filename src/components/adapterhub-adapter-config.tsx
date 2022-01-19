import React, { MutableRefObject, useCallback, useEffect, useState } from "react"
import { Form } from "react-bootstrap"
import { AdapterInputzone } from "./adapter-inputzone"
import { findFirstOrDefault } from "../toolbox"
import Tasks from "../AdapterHub.json"
import { InfoComponent } from "./info-component"

export type NLPTaskType = {
    name: string
    task: string
    defaultDatasetName: string
    datasets: Array<NLPDataset>
}

export type NLPDataset = {
    name: string
    dataset: string
    defaultAdapterIdentifer: string
    adapters: Array<NLPAdapter>
}

export type NLPAdapter = {
    modelName: string
    type: string
    modelTransformerClass: string
    architecture: string
    groupname: string
    nlpTaskType: string
}

export type AdapterConfig = {
    data: Blob
    adapterName: string
    modelClass: string
    modelName: string
}

function getDefaultDataset(taskType: NLPTaskType) {
    return findFirstOrDefault(taskType.datasets, (dataset) => dataset.name === taskType.defaultDatasetName)
}

function getDefaultAdapter(dataset: NLPDataset) {
    return findFirstOrDefault(
        dataset.adapters,
        (adapter) => getAdapterIdentifier(adapter) === dataset.defaultAdapterIdentifer
    )
}

const DefaultTaskType = Tasks.find((task) => task.task === "sentiment")!

const DefaultDataset = getDefaultDataset(DefaultTaskType)
const DefaultAdapter = getDefaultAdapter(DefaultDataset)

function getAdapterIdentifier(adapter: NLPAdapter): string {
    return `${adapter.modelName} | ${adapter.architecture}`
}

export type AdapterhubAdapterConfig = {
    nlpTaskType: NLPTaskType
} & (
    | {
          ownAdapter: false
          nlpDataset: NLPDataset
          nlpAdapter: NLPAdapter
      }
    | {
          ownAdapter: true
          adapterConfig: AdapterConfig | undefined
      }
)

export const DefaultAdapterhubAdapterConfig: AdapterhubAdapterConfig = {
    ownAdapter: false,
    nlpAdapter: DefaultAdapter,
    nlpDataset: DefaultDataset,
    nlpTaskType: DefaultTaskType,
}

export function adapterhubAdapterConfigToNewTaskInput(config: AdapterhubAdapterConfig) {
    if (config.ownAdapter) {
        if (config.adapterConfig == null) {
            throw "unable to convert incomplete adapterhub adapter config to new task input"
        }
        return {
            taskType: config.nlpTaskType.task,
            file: config.adapterConfig.data,
            modelTransformerClass: config.adapterConfig.modelClass,
            trainingDataset: config.adapterConfig.adapterName,
            modelName: config.adapterConfig.modelName,
        }
    } else {
        return {
            taskType: config.nlpTaskType.task,
            modelTransformerClass: config.nlpAdapter.modelTransformerClass,
            trainingDataset: config.nlpDataset.dataset,
            modelName: config.nlpAdapter.modelName,
            adapterArchitecture: config.nlpAdapter.architecture,
            adapterGroupName: config.nlpAdapter.groupname,
            nlpTaskType: config.nlpAdapter.nlpTaskType,
        }
    }
}

function getDefaultAdapterhubAdapterConfigFromNLPTaskType(taskType: NLPTaskType): AdapterhubAdapterConfig {
    const defaultDataset = getDefaultDataset(taskType)
    return {
        ownAdapter: false,
        nlpTaskType: taskType,
        nlpDataset: defaultDataset,
        nlpAdapter: getDefaultAdapter(defaultDataset),
    }
}

function getLabelMappingInfo(config: AdapterhubAdapterConfig): string {
    let mappingInfo!: string
    if (config.ownAdapter) {
        mappingInfo = "No information available for uploaded adapter."
    }
    else if (config.nlpTaskType.task === 'lingaccept') {
        if (config.nlpDataset.dataset ==='cola') {
            mappingInfo = 'acceptable: 1, unacceptable: 0'
        }
    }
    else if (config.nlpTaskType.task === 'sentiment') {
        if (['sst-2', 'imdb', 'rotten_tomatoes'].some(x => x === config.nlpDataset.dataset)) {
            mappingInfo = 'positive: 1, negative: 0'
        }
    }
    else if (config.nlpTaskType.task === 'nli') {
        if (config.nlpDataset.dataset === 'multinli') {
            mappingInfo = "contradiction: 0, entailment: 1, neutral: 2"
        }
        if (config.nlpDataset.dataset === 'qnli') {
            mappingInfo = "entailment: 0, not_entailment: 1"
        }
        if (config.nlpDataset.dataset === 'rte') {
            mappingInfo = "entailment: 0, not_entailment: 1"
        }
        if (config.nlpDataset.dataset=== 'cb') {
            mappingInfo = "entailment: 0, contradiction: 1, neutral: 2"
        }
    }
    else if (config.nlpTaskType.task=== 'sts') {
        if (config.nlpDataset.dataset === 'mrpc') {
            mappingInfo = "equivalent: 0, not_equivalent: 1"
        }
        if (config.nlpDataset.dataset=== 'qqp') {
            mappingInfo = "not_duplicate: 0, duplicate: 1"
        }
        if (config.nlpDataset.dataset ==='sts-b') {
            mappingInfo = "score between 0.0 (least similar) and 5.0 (most similar)"
        }
    }
    else {
        mappingInfo = "There is no information yet about the label mapping for this adapter. Please refer to the respective page on Adapterhub.ml for more information."
    }

    return mappingInfo

}

export function AdapterhubAdapterConfig({
    config,
    setConfig,
    expertMode,
    training,
}: {
    config: AdapterhubAdapterConfig
    setConfig: (config: AdapterhubAdapterConfig) => void
    expertMode: boolean
    training: boolean
}) {
    //const [expertMode, setExportMode] = useState<boolean>(false)
    //const updateLabelMatchingBox = useCallback()

    const setNLPTaskType = useCallback(
        (taskType: NLPTaskType) => {
            setConfig(getDefaultAdapterhubAdapterConfigFromNLPTaskType(taskType))
        },
        [setConfig]
    )

    const setNLPDataset = useCallback(
        (dataset: NLPDataset) => {
            if (config.ownAdapter) {
                return
            }
            setConfig({
                ...config,
                nlpDataset: dataset,
                nlpAdapter: getDefaultAdapter(dataset),
            })
        },
        [config, setConfig]
    )

    const setNLPAdapter = useCallback(
        (adapter: NLPAdapter) => {
            if (config.ownAdapter) {
                return
            }
            setConfig({
                ...config,
                nlpAdapter: adapter,
            })
        },
        [config, setConfig]
    )

    return (
        <>
            <Form>
                <Form.Group>
                    {training ? 
                        <Form.Label> 
                            Training Task Type
                            <InfoComponent text="The text classification task which was used to train the pretrained adapter and will be used for this training Action. See the 'Tasks' page for a list of supported tasks with more information." />
                        </Form.Label>
                            :   
                        <Form.Label> 
                            Prediction Task Type
                            <InfoComponent text="The text classification task which was used to train the pretrained adapter. See the 'Tasks' page for a list of supported tasks with more information." />
                        </Form.Label>
                    }
                    <Form.Control
                        onChange={(event) =>
                            setNLPTaskType(findFirstOrDefault(Tasks, (t) => t.name === event.currentTarget.value))
                        }
                        as="select"
                        value={config.nlpTaskType?.name}
                        custom>
                        {Tasks.map((taskType, index) => (
                            <option key={index}>{taskType.name}</option>
                        ))}
                    </Form.Control>
                </Form.Group>
            </Form>
            <div key="labelMapping" className="bg-light p-3 rounded">
                {getLabelMappingInfo(config)}
            </div>    
            
            {expertMode && [
                <ul key="ul" className="nav nav-tabs mb-3">
                    <li className="nav-item">
                        <a
                            onClick={() =>
                                setConfig(getDefaultAdapterhubAdapterConfigFromNLPTaskType(config.nlpTaskType))
                            }
                            className={!config.ownAdapter ? "nav-link active" : "nav-link"}
                            aria-current="page"
                            style={{ cursor: "pointer" }}>
                            Config
                        </a>
                    </li>
                    <li className="nav-item">
                        <a
                            onClick={() =>
                                setConfig({
                                    ownAdapter: true,
                                    adapterConfig: undefined,
                                    nlpTaskType: config.nlpTaskType,
                                })
                            }
                            className={config.ownAdapter ? "nav-link active" : "nav-link"}
                            aria-current="page"
                            style={{ cursor: "pointer" }}>
                            Upload Adapter
                        </a>
                    </li>
                </ul>,
                <Form key="Form">
                    {config.ownAdapter
                        ? [
                              <p key="warning" className="font-weight-bold text-warning">
                                  Please make sure your adapter was trained on the matching task!
                              </p>,
                              <AdapterInputzone
                                  key="input"
                                  adapterConfig={config.adapterConfig}
                                  setAdapterConfig={(adapterConfig) =>
                                      setConfig({ ownAdapter: true, adapterConfig, nlpTaskType: config.nlpTaskType })
                                  }
                              />,
                          ]
                        : [
                              <Form.Group key={"dataset"}>
                                  <Form.Label>Dataset</Form.Label>
                                  <Form.Control
                                      onChange={(event) =>
                                          setNLPDataset(
                                              findFirstOrDefault(
                                                  config.nlpTaskType?.datasets,
                                                  (t) => t.name === event.currentTarget.value
                                              )
                                          )
                                      }
                                      value={config.nlpDataset?.name}
                                      as="select"
                                      custom>
                                      {config.nlpTaskType?.datasets.map((dataset, index) => (
                                          <option key={index}>{dataset.name}</option>
                                      ))}
                                  </Form.Control>
                              </Form.Group>,

                              <Form.Group key="adapter">
                                  <Form.Label>Adapter</Form.Label>
                                  <Form.Control
                                      onChange={(event) =>
                                          setNLPAdapter(
                                              findFirstOrDefault(
                                                  config.nlpDataset.adapters,
                                                  (t) => getAdapterIdentifier(t) === event.currentTarget.value
                                              )
                                          )
                                      }
                                      value={getAdapterIdentifier(config.nlpAdapter)}
                                      as="select"
                                      custom>
                                      {config.nlpDataset.adapters.map((adapter, index) => (
                                          <option key={index}>{getAdapterIdentifier(adapter)}</option>
                                      ))}
                                  </Form.Control>
                              </Form.Group>,
                          ]}
                </Form>,
            ]}
        </>
    )
}
