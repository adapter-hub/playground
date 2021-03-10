import { DependencyList, useCallback, useEffect, useState } from "react"
import { parse } from "papaparse"

export function findFirstOrDefault<T>(array: Array<T>, predicate: (val: T) => boolean): T {
    const result = array.find(predicate)
    if (result == null) {
        return array[0]
    }
    return result
}

export function useFetchCsv(): [(url: RequestInfo, options?: RequestInit) => void, Array<string> | undefined, boolean] {
    const [response, setResponse] = useState<Array<string> | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const load = useCallback(async (url: RequestInfo, options?: RequestInit) => {
        setLoading(true)
        const res = await fetch(addCorsProxy(url as any), options)
        const json = await res.json()
        if (json.status.http_code !== 200) {
            throw new Error("unable to fetch result")
        }
        const csv = json.contents
        setLoading(false)
        setResponse(
            parse<string>(csv, {
                skipEmptyLines: true,
            }).data
        )
    }, [])
    return [load, response, loading]
}

export function addCorsProxy(url: string): string {
    return `https://ahp.signinit.de/cors-anywhere/${url}`
}
