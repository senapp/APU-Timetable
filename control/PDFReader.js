"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsePDFFile = void 0;
const PDFJS = require("../pdfjs/pdf.mjs");
const pdfjsWorker = require("../pdfjs/pdf.worker.mjs");
const CourseData_1 = require("./CourseData");
const ParsePDFFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
    PDFJS.workerSrc = pdfjsWorker;
    const loadingTask = PDFJS.getDocument(path);
    const pdfDocument = yield loadingTask.promise;
    // Loading
    var pagesPromises = [];
    let totalText = "";
    for (var i = 0; i < pdfDocument._pdfInfo.numPages; i++) {
        (function (pageNumber) {
            pagesPromises.push(getPageText(pageNumber, pdfDocument));
        })(i + 1);
    }
    return new Promise((resolve, reject) => {
        Promise.all(pagesPromises).then(function (pagesText) {
            for (var i = 0; i < pagesText.length; i++) {
                totalText += pagesText[i];
            }
            const result = parseCourseRegData(totalText);
            resolve(result);
        });
    });
});
exports.ParsePDFFile = ParsePDFFile;
const parseCourseRegData = (totalText) => {
    if (totalText.length < 100) {
        return {
            courseCodes: [],
            error: { messeage: "PDF is unreadable. Please go to \"Campus Mate\" and when printing course registration, pick \"Save as PDF\" not \"Microsoft Print to PDF\". | PDF は読み取れません。「Campus Mate」にアクセスし、コース登録を印刷するときに、「Microsoft Print to PDF」ではなく「PDFに保存」を選択してください。" }
        };
    }
    // Japanese or English
    const startIndexEN = totalText.indexOf("Lecture Duration") + 76; // 76 is char until start of string
    const endIndexEN = totalText.indexOf("Total Registered Credits") - 1;
    const startIndexJP = totalText.indexOf("講義期間") + 43; // 47 is char until start of string
    const endIndexJP = totalText.indexOf("登録単位合計") - 1;
    let lines = null;
    let language = CourseData_1.Langauge.English;
    if (startIndexEN > 76) {
        totalText = totalText.slice(startIndexEN, endIndexEN);
        lines = totalText.match(/.+?(?=(SP[12\s]|FA[12\s]|SU[12\s]|WI[12\s]|$))/g);
    }
    else if (startIndexJP > 47) {
        totalText = totalText.slice(startIndexJP, endIndexJP);
        lines = totalText.match(/.+?(?=(春[１２\s]|秋[１２\s]|夏[１２\s]|冬[１２\s]|$))/g);
        language = CourseData_1.Langauge.Japanese;
    }
    else {
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
    let error;
    let courseCodes = [];
    lines.forEach(line => {
        let code = (0, CourseData_1.TryGetCourseCode)(line);
        if (code === null || code.length !== 8) {
            error = { messeage: `The following could not be parsed. Please add it manually: ${line} | 以下は解析できませんでした。手動で追加してください: ${line}` };
        }
        else {
            courseCodes.push(code);
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
};
//# sourceMappingURL=PDFReader.js.map