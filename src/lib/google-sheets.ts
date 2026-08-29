import { getGoogleSheetsConfig, getBarangList, getBranchList, getUserList, getRoleList, getStokLokasiList, getProduksiList, getTransferList, getPenjualanList } from './storage';

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
      stok: getStokLokasiList(),
      produksi: getProduksiList(),
      transfer: getTransferList(),
      penjualan: getPenjualanList(),
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
 * Google Apps Script Web App Backend untuk Aplikasi Mobile Stok Sirup Markisa
 * Petunjuk Pemasangan:
 * 1. Buka Google Spreadsheet baru di https://sheets.new
 * 2. Klik Ekstensi -> Apps Script
 * 3. Hapus kode bawaan dan Tempelkan seluruh kode ini.
 * 4. Klik "Deploy" -> "New deployment" -> Select type: "Web app"
 * 5. Execute as: "Me" | Who has access: "Anyone"
 * 6. Klik Deploy, Berikan Izin Access, lalu Salin Web App URL dan masukkan di Pengaturan Aplikasi.
 */

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var data = contents.data;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'SYNC_ALL') {
      writeSheetData(ss, 'Master_Barang', data.barang, ['id', 'kodeBarang', 'namaBarang', 'nilaiUkuran', 'satuanUkuran', 'keterangan', 'isAktif']);
      writeSheetData(ss, 'Master_Branch', data.branches, ['id', 'kodeBranch', 'namaBranch', 'tipe', 'alamat', 'isAktif']);
      writeSheetData(ss, 'Users', data.users, ['id', 'nama', 'username', 'roleId', 'assignedBranchIds', 'isAktif']);
      writeSheetData(ss, 'Roles', data.roles, ['id', 'namaRole', 'deskripsi']);
      writeSheetData(ss, 'Stok_Lokasi', data.stok, ['branchId', 'barangId', 'jumlahStok']);
      writeSheetData(ss, 'Riwayat_Produksi', data.produksi, ['id', 'noProduksi', 'branchId', 'items', 'tanggal', 'userId', 'userNama']);
      writeSheetData(ss, 'Riwayat_Transfer', data.transfer, ['id', 'noMutasi', 'branchAsalId', 'branchTujuanId', 'items', 'status', 'tanggalKirim', 'userPengirimId', 'userPengirimNama', 'tanggalTerima', 'userPenerimaId', 'userPenerimaNama']);
      writeSheetData(ss, 'Riwayat_Penjualan', data.penjualan, ['id', 'noNota', 'branchId', 'items', 'totalBayar', 'pelanggan', 'tanggal', 'userId', 'userNama']);

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
