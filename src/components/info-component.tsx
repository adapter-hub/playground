import React, { useCallback } from "react"
import { OverlayTrigger, Tooltip } from "react-bootstrap"

export function InfoComponent({
    text,
    className,
    ...props
}: { text: string } & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) {
    const renderTooltip = useCallback((props: any) => <Tooltip {...props}>{text}</Tooltip>, [text])

    return (
        <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={renderTooltip}>
            <i {...props} className={`fas fa-info-circle text-primary ml-2 ${className}`} />
        </OverlayTrigger>
    )
}
