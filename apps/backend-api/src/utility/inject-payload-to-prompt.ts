/**
 * Function to replace placeholders in a template string with corresponding values from an object.
 * Placeholders are in the format {{key}} and are case-insensitive.
 *
 * @param template - The template string containing placeholders.
 * @param values - An object containing key-value pairs for replacement. Keys are case-insensitive.
 * @returns The template string with placeholders replaced by corresponding values from the object.
 */
const injectPayloadToPrompt = (template: string, values: Record<string, any>): string => {
    return template.replace(/{{(.*?)}}/g, (_, key) => {
        const lowerCaseKey = key.toLowerCase().trim()
        return lowerCaseKey in values ? String(values[lowerCaseKey]) : `{{${key}}}`
    })
}

export default injectPayloadToPrompt
