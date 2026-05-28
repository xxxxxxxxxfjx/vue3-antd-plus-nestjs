import * as ExcelJS from 'exceljs';
import { Response } from 'express';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
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

    // 设置列
    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    // 添加数据
    worksheet.addRows(data);

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 设置响应头
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(filename)}.xlsx`,
    );

    // 写入响应
    await workbook.xlsx.write(res);
    res.end();
  }

  static async createTemplate(
    columns: ExcelColumn[],
    filename: string,
    res: Response,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template');

    // 设置列
    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // 添加示例数据
    const exampleRow = {};
    columns.forEach((col) => {
      exampleRow[col.key] = `示例${col.header}`;
    });
    worksheet.addRow(exampleRow);

    // 设置响应头
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
