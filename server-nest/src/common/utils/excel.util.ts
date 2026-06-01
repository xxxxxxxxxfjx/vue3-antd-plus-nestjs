import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportOptions {
  data: any[];
  filename: string;
  res: Response;
  headers?: Record<string, string>;
}

export class ExcelUtil {
  static async exportToExcel<T>(
    data: T[],
    columns: ExcelColumn[],
    filename: string,
    res: Response,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    worksheet.addRows(data);

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(filename)}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  static async export(options: ExportOptions): Promise<void> {
    const { data, filename, res, headers } = options;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    if (data.length > 0) {
      // 自动从数据生成列
      const keys = headers ? Object.keys(headers) : Object.keys(data[0]);
      const columns = keys.map((key) => ({
        header: headers?.[key] || key,
        key,
        width: 15,
      }));

      worksheet.columns = columns;

      // 如果指定了headers，则重命名列头
      if (headers) {
        worksheet.columns.forEach((col: any, i: number) => {
          col.header = headers[keys[i]] || keys[i];
        });
      }
    }

    worksheet.addRows(data);

    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(filename)}`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  static async toJson(filePath: string): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const result: any[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell) => {
          headers.push(cell.value?.toString() || '');
        });
      } else {
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          rowData[headers[colNumber - 1]] = cell.value;
        });
        result.push(rowData);
      }
    });

    return result;
  }

  static async download(
    fileFullPath: string,
    fileName: string,
    res: Response,
  ): Promise<void> {
    if (!fs.existsSync(fileFullPath)) {
      throw new Error(`文件不存在: ${fileFullPath}`);
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(fileName)}`,
    );

    const fileStream = fs.createReadStream(fileFullPath);
    fileStream.pipe(res);
  }

  static async createTemplate(
    columns: ExcelColumn[],
    filename: string,
    res: Response,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template');

    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    const exampleRow = {};
    columns.forEach((col) => {
      exampleRow[col.key] = `示例${col.header}`;
    });
    worksheet.addRow(exampleRow);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(filename)}_template.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
