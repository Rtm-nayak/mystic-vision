// ============================================================
//  Lumen Feedback → Google Sheets  (Google Apps Script)
//  Paste this entire file into your Apps Script editor.
//  Then: Deploy → New deployment → Web App → Anyone → Deploy
// ============================================================

var SHEET_NAME = "Feedback";   // name of the tab in your spreadsheet

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // Create the sheet/tab if it doesn't exist yet
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
      // Add header row
      sheet.appendRow(["Timestamp", "Name", "Email", "Category", "Rating (★)", "Message", "Public Consent"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#1e1b4b").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    // Parse the incoming JSON payload
    var data = JSON.parse(e.postData.contents);

    // Append a new row with the feedback data
    sheet.appendRow([
      data.timestamp  || new Date().toISOString(),
      data.name       || "Anonymous",
      data.email      || "",
      data.category   || "",
      data.rating     || 0,
      data.message    || "",
      data.consent    ? "Yes" : "No"
    ]);

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, 7);

    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: GET handler to test if the script is alive
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "alive", message: "Lumen Feedback Script is running!" }))
    .setMimeType(ContentService.MimeType.JSON);
}
