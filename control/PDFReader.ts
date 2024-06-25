import * as PDFJS from '../pdfjs/pdf.mjs';
import * as pdfjsWorker from '../pdfjs/pdf.worker.mjs';
import { Course, Langauge, StringToCourse } from './CourseData';

export type Error = {
    messeage: string;
}

export type PDFParseCourseData  = {
    error?: Error;
    courses: Course[];
}

export const ParsePDFFile = async (path: ArrayBuffer): Promise<PDFParseCourseData> => {
    PDFJS.workerSrc = pdfjsWorker;
    const loadingTask = PDFJS.getDocument(path as Uint8Array);
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
            courses: [],
            error: { messeage: "PDF is unreadable. Please go to \"Campus Mate\" and when printing course registration, pick \"Save as PDF\" not \"Microsoft Print to PDF\". | PDF は読み取れません。「Campus Mate」にアクセスし、コース登録を印刷するときに、「Microsoft Print to PDF」ではなく「PDFに保存」を選択してください。" }
        };
    }

    // Japanese or English
    const startIndexEN = totalText.indexOf("Lecture Duration") + 76; // 76 is char until start of string
    const endIndexEN = totalText.indexOf("Total Registered Credits") - 1;
    const startIndexJP = totalText.indexOf("講義期間") + 47; // 47 is char until start of string
    const endIndexJP = totalText.indexOf("登録単位合計") - 1;

    let lines: RegExpMatchArray | null = null;
    let language: Langauge = Langauge.English;
    if (startIndexEN > 76) {
        totalText = totalText.slice(startIndexEN, endIndexEN);
        lines = totalText.match(/.+?(?=(SP|SP1|SP2|FA|FA1|FA2|SU1|WI1|$))/g);
    } else if (startIndexJP > 47) {
        totalText = totalText.slice(startIndexJP, endIndexJP);
        lines = totalText.match(/.+?(?=(春|春1|春2|秋|秋1|秋2|夏1|冬1|$))/g);
        language = Langauge.Japanese;
    } else {
        return {
            courses: [],
            error: { messeage: "Could not recognize the Course Registration PDF, are you sure the file is correct? | コース登録 PDF を認識できませんでした。ファイルが正しいかどうか確認してください。" }
        };
    }

    if (lines === null || lines === undefined || lines.length === 0) {
        return {
            courses: [],
            error: { messeage: "Could not recognize the Course Registration PDF, are you sure the file is correct? | コース登録 PDF を認識できませんでした。ファイルが正しいかどうか確認してください。" }
        };
    }

    let error: Error | undefined;
    let courses: Course [] = [];
    lines.forEach(line => {
        let course = StringToCourse(line, language, courses.map((course) => course.code));
        if (course === null) {
            error = { messeage: `The following could not be parsed. Please add it manually: ${line} | 以下は解析できませんでした。手動で追加してください: ${line}` }
        } else {
            for (let index = 0; index < courses.length; index++) {
                const element = courses[index];
                if (element.code === course.code) {
                    course.credits = element.credits;
                    break;
                }
            }
            courses.push(course);
        }
    });

    return {
        courses: courses,
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
