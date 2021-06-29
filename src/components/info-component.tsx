import React, { useCallback } from "react"
import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { Placement } from "react-bootstrap/esm/Overlay"

export function InfoComponent({
    text,
    className,
    color,
    placement,
    ...props
}: { text: string; placement?: Placement; color?: string } & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
>) {
    const renderTooltip = useCallback((props: any) => <Tooltip {...props}>{text}</Tooltip>, [text])

    return (
        <OverlayTrigger placement={placement ?? "top"} delay={{ show: 250, hide: 400 }} overlay={renderTooltip}>
            <i {...props} className={`fas fa-info-circle text-${color ?? "primary"} ml-2 ${className}`} />
        </OverlayTrigger>
    )
}
