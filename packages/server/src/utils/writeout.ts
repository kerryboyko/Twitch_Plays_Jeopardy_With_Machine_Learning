import fs from "fs";

export const writeOut = (filename: string, data: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.writeFile(filename, data, (err): void => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

export default writeOut;
