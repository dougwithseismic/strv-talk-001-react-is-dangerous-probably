import z from 'zod'

/**
 * Generates an array structure based on the provided Zod schema using the actual keys and types as values.
 * Includes comments with descriptions above each array part.
 *
 * @param {z.ZodObject<any>} schema - The Zod schema that defines the object structure.
 * @returns {any[]} - The resulting array structure based on the schema.
 */
const generateShorthandPromptFromSchema = (schema: z.ZodObject<any>): any[] => {
    const result: any[] = []
    const schemaTypeMap: { [key: string]: string } = {
        ZodObject: 'object',
        ZodArray: 'array',
        ZodEnum: 'enum',
        ZodUnion: 'union',
    }

    Object.keys(schema.shape).forEach((key) => {
        const currentSchema = schema.shape[key]
        const description = currentSchema._def.description || ''
        const schemaType = currentSchema._def.typeName as keyof typeof schemaTypeMap

        switch (schemaType) {
            case 'ZodObject':
                result.push(`// ${description}`)
                result.push(generateShorthandPromptFromSchema(currentSchema))
                break
            case 'ZodArray': {
                const type = `array of ${currentSchema._def.type._def.typeName.toLowerCase()}s`
                const arrayElementSchema = currentSchema._def.type
                if (arrayElementSchema._def.typeName === 'ZodObject') {
                    result.push([generateShorthandPromptFromSchema(arrayElementSchema)])
                } else {
                    result.push([`${key} (${type}) // ${description} (${type})`])
                }
                break
            }
            case 'ZodEnum':
                result.push(
                    `${key} (${schemaTypeMap[schemaType]}: ${currentSchema._def.values.join(
                        ' | '
                    )}) // ${description} (${schemaTypeMap[schemaType]})`
                )
                break
            case 'ZodUnion': {
                const unionTypes = currentSchema._def.options
                    .map((option: any) => option._def.typeName.toLowerCase())
                    .join(' | ')
                result.push(
                    `${key} (${schemaTypeMap[schemaType]}: ${unionTypes}) // ${description} (${schemaTypeMap[schemaType]})`
                )
                break
            }
            default:
                const type = currentSchema._def.typeName.toLowerCase()
                result.push(`${key} (${type}) // ${description} (${type})`)
                break
        }
    })
    return result
}

export default generateShorthandPromptFromSchema
