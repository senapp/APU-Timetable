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
exports.ParseExcelRows = void 0;
const read_excel_file_1 = require("read-excel-file");
const ParseExcelRows = (path) => __awaiter(void 0, void 0, void 0, function* () {
    let rows = [];
    yield (0, read_excel_file_1.default)(path).then((excelRows) => {
        excelRows.forEach(row => {
            rows.push(row);
        });
    });
    return rows;
});
exports.ParseExcelRows = ParseExcelRows;
//# sourceMappingURL=ExcelFilter.js.map