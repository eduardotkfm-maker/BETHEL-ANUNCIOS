/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-expect-error: papaparse is lacking declaration file
import Papa from 'papaparse';

export const parseCSVData = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: any) => {
                if (results.errors.length) {
                    console.error("PapaParse erros:", results.errors);
                    // reject(results.errors);
                }
                resolve(results.data);
            },
            error: (error: Error) => {
                reject(error);
            }
        });
    });
};
