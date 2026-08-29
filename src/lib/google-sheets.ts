import {
  getGoogleSheetsConfig,
  getBarangList,
  getBranchList,
  getUserList,
  getRoleList,
  getMutasiList,
  bulkImportStorageData,
} from './storage';

export async function fetchFromGoogleSheets(): Promise<{ success: boolean; message: string }> {
  const config = getGoogleSheetsConfig();
  if (!config.webAppUrl) {
    return { success: false, message: 'URL Google Apps Script Web App belum dikonfigurasi.' };
  }

  try {
    const res = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: config.webAppUrl,
        payload: { action: 'GET_ALL' },
      }),
    });

    const result = await res.json();
    if (res.ok && result.success && result.data) {
      bulkImportStorageData(result.data);
      return { success: true, message: 'Data live berhasil dibaca dari Google Sheets!' };
    } else {
      return { success: false, message: result.error || 'Gagal membaca data dari Google Sheets.' };
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'Koneksi ke proxy gagal.' };
  }
}

export async function syncToGoogleSheets(): Promise<{ success: boolean; message: string }> {
  const config = getGoogleSheetsConfig();
  if (!config.webAppUrl) {
    return { success: false, message: 'URL Google Apps Script Web App belum dikonfigurasi.' };
  }

  const payload = {
    action: 'SYNC_ALL',
    timestamp: new Date().toISOString(),
    data: {
      barang: getBarangList(),
      branches: getBranchList(),
      users: getUserList(),
      roles: getRoleList(),
      mutasi: getMutasiList(),
    },
  };

  try {
    const res = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: config.webAppUrl,
        payload,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: 'Data berhasil disinkronkan ke Google Sheets!' };
    } else {
      return { success: false, message: data.error || 'Gagal mengirim data ke Google Sheets.' };
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'Koneksi ke serverless proxy gagal.' };
  }
}

export function triggerAutoSyncIfNeeded(): void {
  const config = getGoogleSheetsConfig();
  if (config.webAppUrl && config.autoSync) {
    syncToGoogleSheets().catch(() => {});
  }
}

export function generateGoogleAppsScriptCode(): string {
  return `/**
 * Google Apps Script Web App Backend untuk Aplikasi Mobile Stok Sirup Markisa (Single Ledger Mutasi Backend)
 */

function doGet(e) {
  return handleGetAll();
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var data = contents.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'GET_ALL') {
      return handleGetAll();
    }

    if (action === 'SYNC_ALL') {
      writeSheetData(ss, 'Master_Barang', data.barang, ['id', 'kodeBarang', 'namaBarang', 'nilaiUkuran', 'satuanUkuran', 'keterangan', 'isAktif']);
      writeSheetData(ss, 'Master_Branch', data.branches, ['id', 'kodeBranch', 'namaBranch', 'tipe', 'alamat', 'isAktif']);
      writeSheetData(ss, 'Users', data.users, ['id', 'nama', 'username', 'pin', 'roleId', 'assignedBranchIds', 'isAktif']);
      writeSheetData(ss, 'Roles', data.roles, ['id', 'namaRole', 'deskripsi', 'permissions']);
      writeSheetData(ss, 'Mutasi_Stok', data.mutasi, ['id', 'tanggal', 'jenisTransaksi', 'kodeBarang', 'jumlah', 'sumberBranchId', 'tujuanBranchId', 'status', 'userId', 'userNama', 'noRef', 'hargaSatuan', 'keterangan']);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Sync Google Sheets berhasil!',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown Action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleGetAll() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var barang = readSheetData(ss, 'Master_Barang');
  var branches = readSheetData(ss, 'Master_Branch');
  var users = readSheetData(ss, 'Users');
  var roles = readSheetData(ss, 'Roles');
  var mutasi = readSheetData(ss, 'Mutasi_Stok');

  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Data live berhasil dibaca dari Google Sheets!',
    data: {
      barang: barang,
      branches: branches,
      users: users,
      roles: roles,
      mutasi: mutasi
    }
  })).setMimeType(ContentService.MimeType.JSON);
}

function readSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (!data || data.length < 2) return [];

  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    var hasValue = false;
    for (var h = 0; h < headers.length; h++) {
      var key = headers[h];
      var val = row[h];
      if (val !== '' && val !== null && val !== undefined) {
        hasValue = true;
      }
      if (typeof val === 'number') {
        val = String(val);
      }
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try {
          val = JSON.parse(val);
        } catch (err) {}
      }
      obj[key] = val;
    }
    if (hasValue) {
      result.push(obj);
    }
  }
  return result;
}

function writeSheetData(ss, sheetName, items, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clear();
  
  if (!items || items.length === 0) {
    sheet.appendRow(headers);
    return;
  }

  var rows = [headers];
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var row = [];
    for (var h = 0; h < headers.length; h++) {
      var val = item[headers[h]];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      row.push(val !== undefined ? val : '');
    }
    rows.push(row);
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#fef3c7');
}
`;
}
