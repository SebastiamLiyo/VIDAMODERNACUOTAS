function doPost(e) {
    try {
        const sheetId = "1q2bMt0rdg8sczPS3rkaQpqBRf8A5HlVFySXXm2lodu4";
        const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
        const data = JSON.parse(e.postData.contents).sales;

        sheet.clearContents(); 

        const headers = ["Fecha", "Cliente", "Producto", "Total", "Cuotas", "Vendedor", "Próx. Pago", "Estado", "Progreso", "Próx. Cuota", "Total Pagado"];
        sheet.appendRow(headers);

        data.forEach(sale => {
            sheet.appendRow([
                sale.date, sale.client, sale.product, sale.total,
                sale.installments, sale.seller, sale.nextPayment,
                sale.status, sale.progress, sale.nextInstallment,
                sale.totalPaid
            ]);
        });

        return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", error: error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Sales App')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}