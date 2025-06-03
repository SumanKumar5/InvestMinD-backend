const ExcelJS = require('exceljs');
const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const fetchPrice = require('../utils/fetchPrice');

exports.exportHoldingsToExcel = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);
    if (!portfolio || portfolio.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized or portfolio not found' });
    }

    const holdings = await Holding.find({ portfolio: portfolio._id });

    // Prevent exporting an excessively large dataset
    if (holdings.length > 1000) {
      return res.status(400).json({ message: 'Too many holdings to export. Please filter your data.' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Holdings');

    // Define columns
    sheet.columns = [
      { header: 'Symbol', key: 'symbol', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Avg Buy Price ($)', key: 'avgBuyPrice', width: 18 },
      { header: 'Live Price ($)', key: 'livePrice', width: 15 },
      { header: 'Invested ($)', key: 'invested', width: 15 },
      { header: 'Current Value ($)', key: 'currentValue', width: 20 },
      { header: 'Profit/Loss ($)', key: 'profitLoss', width: 18 }
    ];

    // Style header row
    sheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDCE6F1' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data rows
    for (const h of holdings) {
      const livePrice = await fetchPrice(h.symbol);
      const invested = h.quantity * h.avgBuyPrice;
      const currentValue = h.quantity * livePrice;
      const profitLoss = currentValue - invested;

      const row = sheet.addRow({
        symbol: h.symbol,
        quantity: h.quantity,
        avgBuyPrice: Number(h.avgBuyPrice.toFixed(2)),
        livePrice: Number(livePrice.toFixed(2)),
        invested: Number(invested.toFixed(2)),
        currentValue: Number(currentValue.toFixed(2)),
        profitLoss: Number(profitLoss.toFixed(2))
      });

      // Style Profit/Loss cell (green if >=0, red if <0)
      const plCell = row.getCell('profitLoss');
      plCell.font = {
        color: { argb: profitLoss >= 0 ? 'FF008000' : 'FFFF0000' },
        bold: true
      };

      // Apply number formatting to numeric columns
      ['avgBuyPrice', 'livePrice', 'invested', 'currentValue', 'profitLoss'].forEach((key, idx) => {
        const cell = row.getCell(idx + 3); // columns: symbol (1), quantity (2), then these
        cell.numFmt = '#,##0.00';
      });

      // Apply alignment and borders to all cells in the row
      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }

    // Set response headers for file download
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=portfolio-${portfolio._id.toString()}.xlsx`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('❌ Excel export error:', err.message);
    res.status(500).json({ message: 'Failed to export Excel' });
  }
};
