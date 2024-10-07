import readXlsxFile, { Row } from 'read-excel-file'


export const ParseExcelRows = async (path: ArrayBuffer): Promise<Row[]> => {
    let rows: Row[] = [];
    await readXlsxFile(path).then((excelRows) => {
        excelRows.forEach(row => {
            rows.push(row);
        });
    })
    return rows;
}