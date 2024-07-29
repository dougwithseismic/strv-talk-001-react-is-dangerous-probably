import z from "zod"

/**
 * Maps an array of values to an object structure based on the provided Zod schema.
 *
 * @param {z.ZodObject<any>} schema - The Zod schema that defines the object structure.
 * @param {any} payload - The array payload to be mapped to the object structure.
 * @returns {any} - The resulting object with values mapped from the array payload according to the schema.
 *
 * @example
 * const schema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 *   address: z.object({
 *     street: z.string(),
 *     city: z.string()
 *   }),
 *   hobbies: z.array(z.string())
 * });
 * 
 * const payload = ["John Doe", 30, ["123 Main St", "Somewhere"], ["reading", "hiking"]];
 * 
 * const result = mapArrayToObject(schema, payload);
 * console.log(result);
 * // Output:
 * // {
 * //   name: "John Doe",
 * //   age: 30,
 * //   address: {
 * //     street: "123 Main St",
 * //     city: "Somewhere"
 * //   },
 * //   hobbies: ["reading", "hiking"]
 * // }
 */
const mapArrayToObject = (schema: z.ZodObject<any>, payload: any): any => {
    const bucket: { [key: string]: any } = {}

    Object.keys(schema.shape).forEach((key, index) => {
        const currentSchema = schema.shape[key]
        const currentPayload = payload[index]

        if (currentSchema instanceof z.ZodObject) {
            bucket[key] = mapArrayToObject(currentSchema, currentPayload)
        } else if (currentSchema instanceof z.ZodArray && Array.isArray(currentPayload)) {
            bucket[key] = currentPayload.map((item) => {
                if (currentSchema._def.type instanceof z.ZodObject) {
                    return mapArrayToObject(currentSchema._def.type, item)
                }
                return item
            })
        } else {
            bucket[key] = currentPayload
        }
    })

    return bucket
}

export default mapArrayToObject
