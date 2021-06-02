import React, { ReactNode } from "react"

export function LoadingComponent({ children, white }: { children?: ReactNode; white?: boolean }) {
    return (
        <div className="d-flex flex-row align-items-center">
            <div className={`spinner-border ${white ? "text-white" : "text-primary"}`} role="status">
                <span className="sr-only">Loading...</span>
            </div>
            <span className="ml-2">{children}</span>
        </div>
    )
}
