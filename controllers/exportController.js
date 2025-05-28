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

    // Style header
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

    // Add rows (no blanks, all numbers)
    for (const h of holdings) {
      const livePrice = await fetchPrice(h.symbol);
      const invested = h.quantity * h.avgBuyPrice;
      const currentValue = h.quantity * livePrice;
      const profitLoss = currentValue - invested;

      const row = sheet.addRow({
        symbol: h.symbol,
        quantity: h.quantity,
        avgBuyPrice: parseFloat(h.avgBuyPrice.toFixed(2)),
        livePrice: parseFloat(livePrice.toFixed(2)),
        invested: parseFloat(invested.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2))
      });

      // Profit/Loss styling
      const plCell = row.getCell('profitLoss');
      plCell.font = {
        color: { argb: profitLoss >= 0 ? 'FF008000' : 'FFFF0000' },
        bold: true
      };

      // Apply number formatting
      ['avgBuyPrice', 'livePrice', 'invested', 'currentValue', 'profitLoss'].forEach((key, idx) => {
        const cell = row.getCell(idx + 3); // index +3 because 1-based and after symbol & qty
        cell.numFmt = '#,##0.00';
      });

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

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=portfolio-${portfolio._id}.xlsx`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error("❌ Excel export error:", err.message);
    res.status(500).json({ message: 'Failed to export Excel' });
  }
};
