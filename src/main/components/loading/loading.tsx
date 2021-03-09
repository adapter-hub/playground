import React, { PropsWithChildren, ReactNode } from "react"

export default function Loading({ children }: { children?: ReactNode }) {
    return (
        <div className="d-flex flex-row align-items-center">
            <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
            </div>
            <span className="ml-2">{children}</span>
        </div>
    )
}
