// Yedek dosyasını cihaza kaydetme / cihazdan okuma (web).
//
// iOS'ta `a[download]` ana ekrandan açılan (standalone) uygulamada güvenilir
// çalışmıyor; bu yüzden dosya paylaşımı destekliyorsa önce Paylaş sayfası
// (Dosyalar'a Kaydet) denenir. Kaydetme genellikle verinin bulunduğu Safari
// sekmesinde yapılır; okuma ise her yerde çalışan <input type="file"> ile.
import { Platform } from 'react-native';

function isWeb() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && !!window.document;
}

export function canShareFiles() {
  if (!isWeb() || !navigator.share || !navigator.canShare) return false;
  try {
    const probe = new window.File(['x'], 'x.json', { type: 'application/json' });
    return navigator.canShare({ files: [probe] });
  } catch (e) {
    return false;
  }
}

// Paylaş sayfasını açar (iOS: "Dosyalara Kaydet"). -> true/false
export async function shareBackup(text, filename) {
  if (!canShareFiles()) return false;
  try {
    const file = new window.File([text], filename, { type: 'application/json' });
    await navigator.share({ files: [file], title: filename });
    return true;
  } catch (e) {
    return false; // kullanıcı vazgeçti ya da desteklenmiyor
  }
}

// Klasik indirme. -> true/false
export function downloadBackup(text, filename) {
  if (!isWeb()) return false;
  try {
    const blob = new window.Blob([text], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    // URL'i hemen bırakmayalım: bazı tarayıcılar indirmeyi geciktiriyor.
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    return true;
  } catch (e) {
    return false;
  }
}

// Yedek dosyası seçtirir ve METNİNİ döndürür. Vazgeçilirse null.
export function pickBackupFile() {
  if (!isWeb()) return Promise.resolve(null);
  return new Promise((resolve) => {
    const input = window.document.createElement('input');
    input.style.display = 'none';
    input.setAttribute('type', 'file');
    // iOS'ta bazı dosyalar "public.json" olarak görünmediği için .txt de kabul.
    input.setAttribute('accept', 'application/json,.json,.txt,text/plain');
    let settled = false;
    const finish = (val) => {
      if (settled) return;
      settled = true;
      if (input.parentNode) input.parentNode.removeChild(input);
      resolve(val);
    };
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return finish(null);
      const reader = new window.FileReader();
      reader.onload = () => finish(String(reader.result || ''));
      reader.onerror = () => finish(null);
      reader.readAsText(file);
    });
    input.addEventListener('cancel', () => finish(null));
    window.document.body.appendChild(input);
    input.click();
  });
}
