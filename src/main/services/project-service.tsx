import React from "react"
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react"
import { BehaviorSubject, Subject, Subscription } from "rxjs"
import { debounceTime, skip, tap } from "rxjs/operators"
import { KaggleCloudComputingAPI } from "../api/cloudComputing/kaggle/KaggleCloudComputingAPI"
import { CloudComputingProject } from "../api/cloudComputing/models/CloudComputingProject"
import { CredentialsContext } from "../app"

export class ProjectService {
    private api: KaggleCloudComputingAPI | undefined
    private projectsSubject = new BehaviorSubject<Array<CloudComputingProject> | undefined>(undefined)
    private loadingSubject = new BehaviorSubject(false)

    private reloadSubject = new Subject<void>()

    constructor() {
        this.reloadSubject
            .pipe(
                debounceTime(100),
                tap(() => this.reloadProjects())
            )
            .subscribe()
    }

    private reloadProjects(): void {
        if (this.api == null || this.loadingSubject.value) {
            return
        }
        this.loadingSubject.next(true)
        this.api
            .getProjects()
            .then((projects) => this.projectsSubject.next(projects))
            .catch((error) => {
                //TODO
            })
            .finally(() => this.loadingSubject.next(false))
    }

    useProjects(): { projects: Array<CloudComputingProject>; loading: boolean; reload: () => void } {
        const { credentials } = useContext(CredentialsContext)
        if (this.api == null) {
            this.api = new KaggleCloudComputingAPI(credentials.username, credentials.key)
            this.reloadSubject.next()
        }
        const [projects, setProjects] = useState(() => this.projectsSubject.value)
        const [loading, setLoading] = useState(() => this.loadingSubject.value)
        useEffect(() => {
            const subscription = new Subscription()
            subscription.add(
                this.projectsSubject
                    .pipe(
                        skip(1),
                        tap((projects) => setProjects(projects))
                    )
                    .subscribe()
            )
            subscription.add(this.loadingSubject.pipe(tap((loading) => setLoading(loading))).subscribe())
            return () => subscription.unsubscribe()
        })
        return {
            projects: projects ?? [],
            loading,
            reload: () => this.reloadSubject.next(),
        }
    }

    useProject(
        sheetIdHash: string,
        projectName: string
    ): { project: CloudComputingProject | undefined; loading: boolean } {
        const { projects, loading } = this.useProjects()
        return {
            project: this.findMatchingProject(projects, sheetIdHash, projectName),
            loading,
        }
    }

    private findMatchingProject(
        projects: Array<CloudComputingProject>,
        sheetIdHash: string,
        projectName: string
    ): CloudComputingProject | undefined {
        return projects.find((project) => {
            if (project.getKernels().length === 0) {
                return false
            }
            const kernel = project.getKernels()[0].kernel
            return kernel.sheetIdHash === sheetIdHash && kernel.name === projectName
        })
    }
}

const projectService = new ProjectService()

const ProjectServiceContext = createContext<ProjectService>(projectService)

export function useProjects() {
    const projectService = useContext(ProjectServiceContext)
    return projectService.useProjects()
}

export function useProject(sheetIdHash: string, projectName: string) {
    const projectService = useContext(ProjectServiceContext)
    return projectService.useProject(sheetIdHash, projectName)
}

export function ProjectServiceProvider({ children }: PropsWithChildren<any>) {
    return <ProjectServiceContext.Provider value={projectService}>{children}</ProjectServiceContext.Provider>
}
