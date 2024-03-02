

export const prettyJsonString = (data: any): string => {
    return JSON.stringify(data, null, 2);
}