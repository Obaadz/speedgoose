import {Document, Aggregate, Query} from "mongoose"
import {CachedDocument} from "../types/types"
import {getConfig} from "./commonUtils"
import {stringifyPopulatedPaths, stringifyQueryParam} from "./queryUtils"

export const generateCacheKeyFromQuery = <T>(query: Query<T, T>): string => JSON.stringify(
    {
        ...query.getQuery(),
        collection: query.mongooseCollection.name,
        op: query.op,
        options: query.getOptions()
    }
)

export const generateCacheKeyFromPipeline = <R>(aggregation: Aggregate<R>): string => JSON.stringify(
    {
        pipeline: aggregation.pipeline(),
        collection: aggregation._model.collection.name,
    }
)

export const generateCacheKeyForSingleDocument = <T extends CachedDocument>(query: Query<T, T>, record: Document<T>): string => {
    if (!query.selected) {
        return String(record._id)
    }

    const projectionFields = stringifyQueryParam(query?.projection() as Record<string, number> ?? {})
    const populationFields = stringifyPopulatedPaths(query?.getPopulatedPaths() ?? [])

    return `${record._id}_${projectionFields}_${populationFields}`
}

export const generateCacheKeyForModelName = (modelName: string, multitenantValue = ''): string =>
    `${modelName}_${String(multitenantValue)}`

export const generateCacheKeyForRecordAndModelName = <T>(record: Document<T>, modelName: string): string => {
    const config = getConfig()
    const multitenantKey = config?.multitenancyConfig?.multitenantKey

    return multitenantKey ? `${modelName}_${String(record[multitenantKey])}` : modelName
}
