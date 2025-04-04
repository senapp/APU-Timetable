import * as PDFJS from '../pdfjs/pdf.mjs';
import * as pdfjsWorker from '../pdfjs/pdf.worker.mjs';
import { Langauge, TryGetCourseCode } from './CourseData';

export type Error = {
    messeage: string;
}

export type PDFParseCourseData  = {
    error?: Error;
    courseCodes: string[];
}

export const ParsePDFFile = async (path: ArrayBuffer): Promise<PDFParseCourseData> => {
    PDFJS.workerSrc = pdfjsWorker;
    const loadingTask = PDFJS.getDocument(path as unknown as Uint8Array);
    const pdfDocument = await loadingTask.promise;

    // Loading
    var pagesPromises: Promise<unknown>[]  = [];
    let totalText: string = "";
    for (var i = 0; i < pdfDocument._pdfInfo.numPages; i++) {
        (function (pageNumber) {
            pagesPromises.push(getPageText(pageNumber, pdfDocument));
        })(i + 1);
    }


    return new Promise((resolve, reject) => {
        Promise.all(pagesPromises).then(function (pagesText) {
            for(var i = 0;i < pagesText.length;i++){
                totalText += pagesText[i];
            }
            const result = parseCourseRegData(totalText);
            resolve(result);
        });
    });
};

const parseCourseRegData = (totalText: string): PDFParseCourseData => {
    if (totalText.length < 100) {
        return {
            courseCodes: [],
            error: { messeage: "PDF is unreadable. Please go to \"Campus Mate\" and when printing course registration, pick \"Save as PDF\" not \"Microsoft Print to PDF\". | PDF は読み取れません。「Campus Mate」にアクセスし、コース登録を印刷するときに、「Microsoft Print to PDF」ではなく「PDFに保存」を選択してください。" }
        };
    }

    
    if (totalText.includes("履 修 登 録 確 認")) {
        let filteredText = "";
        for (let index = 0; index < totalText.length - 2; index++) {
            if (totalText[index] === " ") {
                if (totalText[index] === " " && totalText[index + 1] === " " && index[index + 2] === " ") {
                    index = index + 2;
                    filteredText += "   ";
                } else if (totalText[index] === " " && totalText[index + 1] === " ") {
                    index = index + 1;
                    filteredText += "   ";
                } else {
                    continue;
                }
            } else {
                filteredText += totalText[index];
            }
        }
        totalText = filteredText;
    }
    
    // Japanese or English
    const startIndexEN = totalText.indexOf("Lecture Duration") + 76; // 76 is char until start of string
    const endIndexEN = totalText.indexOf("Total Registered Credits") - 1;
    const startIndexJP = totalText.indexOf("講義期間") + 43; // 47 is char until start of string
    const endIndexJP = totalText.indexOf("登録単位合計") - 1;

    let lines: RegExpMatchArray | null = null;
    let language: Langauge = Langauge.English;
    if (startIndexEN > 76) {
        totalText = totalText.slice(startIndexEN, endIndexEN);
        lines = totalText.match(/.+?(?=(SP[12\s]|FA[12\s]|SU[12\s]|WI[12\s]|$))/g);
    } else if (startIndexJP > 47) {
        totalText = totalText.slice(startIndexJP, endIndexJP);
        lines = totalText.match(/.+?(?=(春[１２\s]|秋[１２\s]|夏[１２\s]|冬[１２\s]|$))/g);
        language = Langauge.Japanese;
    } else {
        return {
            courseCodes: [],
            error: { messeage: "Could not recognize the Course Registration PDF, are you sure the file is correct? | コース登録 PDF を認識できませんでした。ファイルが正しいかどうか確認してください。" }
        };
    }

    if (lines === null || lines === undefined || lines.length === 0) {
        return {
            courseCodes: [],
            error: { messeage: "Could not recognize the Course Registration PDF, are you sure the file is correct? | コース登録 PDF を認識できませんでした。ファイルが正しいかどうか確認してください。" }
        };
    }

    let error: Error | undefined;
    let courseCodes: string [] = [];
    lines.forEach(line => {
        if (line.length > 5) {
            let code = TryGetCourseCode(line);
            if (code === null || code.length !== 8) {
                error = { messeage: `The following could not be parsed. Please add it manually: ${line} | 以下は解析できませんでした。手動で追加してください: ${line}` }
            } else {
                courseCodes.push(code);
            }
        } else {
            // Ignore, parsing artifacts
        }
    });

    return {
        courseCodes: courseCodes,
        error: error
    };
};

// Gets text on the selected PDF page and returns a promise to resolve it.
const getPageText = (pageNum, PDFDocumentInstance) => {
    return new Promise(function (resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
            pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var finalString = "";

                for (var i = 0; i < textItems.length; i++) {
                    var item = textItems[i];

                    finalString += item.str + " ";
                }

                resolve(finalString);
            });
        });
    });
}
