export const getUserFromStorage = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['user'], (result) => {
            if (result.user) {
                resolve(result.user)
            } else {
                reject(new Error("User not found in storage"))
            }
        })
    }) 
}
