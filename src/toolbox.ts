export function toAbsoluteStaticFilePath(filename: string) {
    return `/${filename}`
}

export function findFirstOrDefault<T>(array: Array<T>, predicate: (val: T) => boolean): T {
    const result = array.find(predicate)
    if (result == null) {
        return array[0]
    }
    return result
}