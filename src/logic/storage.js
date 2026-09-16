// Kalıcı depolama katmanı — İKİ AYRI YERE birden yazar.
//
// NEDEN?
// Uygulama şimdiye kadar yalnızca AsyncStorage (web'de localStorage) kullandı.
// Tarayıcı bu alanı "silinebilir" sayıyor: iOS Safari siteye 7 gün girilmezse
// script ile yazılmış veriyi temizliyor, disk daralınca da silinebiliyor.
// Kardeş uygulamada (Gezgin Günlüğü) bu yüzden gerçek bir veri kaybı yaşandı.
//
// Bu yüzden:
//   * her kayıt hem localStorage'a hem IndexedDB'ye yazılır (veri küçük,
//     maliyeti yok). Biri silinirse diğeri kurtarır.
//   * okumada hangisi daha yeniyse (rev) o kullanılır.
//   * GÖÇ YOK: eski localStorage kaydı olduğu yerde kalır, üzerine yazılmaz;
//     yalnızca yanına bir kopya daha eklenir. Böylece bu değişiklik hiçbir
//     veriyi riske atmaz.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const STORAGE_KEY = '@ibadetlerim_v1';
const DB_NAME = 'ibadetlerim';
const STORE = 'kv';

function idbAvailable() {
  return Platform.OS === 'web' && typeof indexedDB !== 'undefined';
}

// Sürüm çakışmasını önlemek için önce sürümsüz açar; depo eksikse bir üst
// sürümle yükseltir. Sabit sürüm istemek, veritabanı daha yüksek sürümdeyse
// VersionError verir ve okuma tamamen başarısız olur.
function openRaw(version) {
  return new Promise((resolve, reject) => {
    const req = version ? indexedDB.open(DB_NAME, version) : indexedDB.open(DB_NAME);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('indexedDB açılamadı'));
    req.onblocked = () => reject(new Error('indexedDB yükseltmesi engellendi'));
  });
}

let dbPromise = null;
function openDB() {
  if (!dbPromise) {
    dbPromise = (async () => {
      let db = await openRaw();
      if (!db.objectStoreNames.contains(STORE)) {
        const next = (db.version || 1) + 1;
        db.close();
        db = await openRaw(next);
      }
      db.onversionchange = () => {
        try {
          db.close();
        } catch (e) {
          /* yoksay */
        }
        dbPromise = null;
      };
      return db;
    })().catch((e) => {
      dbPromise = null;
      throw e;
    });
  }
  return dbPromise;
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const r = tx.objectStore(STORE).get(key);
    r.onsuccess = () => resolve(r.result == null ? null : r.result);
    r.onerror = () => reject(r.error);
  });
}

async function idbSet(key, val) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(val, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function parseSafe(raw) {
  if (typeof raw !== 'string' || !raw) return null;
  try {
    const o = JSON.parse(raw);
    return o && typeof o === 'object' ? o : null;
  } catch (e) {
    return null;
  }
}

const revOf = (o) => (o ? Number(o.rev) || 0 : -1);
const savedOf = (o) => (o ? Number(o.savedAt) || 0 : -1);

// Kayıtta gerçekten veri var mı? (yalnızca sürüme bakmak YETMEZ)
function hasContent(o) {
  if (!o) return false;
  const c = countsOf(o);
  return c.days > 0 || c.marks > 0 || c.custom > 0 || c.lifetime > 0 || c.years > 0;
}

// İki kaynağı da okur, daha YENİ olanı döndürür.
// -> { payload, from, sources: { local, idb }, errors: [] }
export async function readState() {
  const errors = [];
  let local = null;
  let idb = null;
  try {
    local = parseSafe(await AsyncStorage.getItem(STORAGE_KEY));
  } catch (e) {
    errors.push('localStorage: ' + (e.message || 'okunamadı'));
  }
  if (idbAvailable()) {
    try {
      idb = parseSafe(await idbGet(STORAGE_KEY));
    } catch (e) {
      errors.push('indexedDB: ' + (e.message || 'okunamadı'));
    }
  }
  let payload = null;
  let from = null;
  if (local && idb) {
    // ÖNCE İÇERİK, sonra sürüm.
    // Yalnızca rev karşılaştırmak tehlikeli: uygulama bir kez boş açılıp
    // rev 1'lik BOŞ bir kayıt yazdıysa, kullanıcının rev'i olmayan (rev 0
    // sayılan) DOLU eski kaydı buna yenilir ve veri kaybolur. Bu durum testte
    // birebir üretildi. Bu yüzden dolu bir kayıt, boş bir kayda asla yenilmez.
    const lc = hasContent(local);
    const ic = hasContent(idb);
    if (lc !== ic) {
      payload = lc ? local : idb;
      from = lc ? 'local' : 'idb';
    } else {
      const idbNewer = revOf(idb) > revOf(local) || (revOf(idb) === revOf(local) && savedOf(idb) > savedOf(local));
      payload = idbNewer ? idb : local;
      from = idbNewer ? 'idb' : 'local';
    }
  } else if (local) {
    payload = local;
    from = 'local';
  } else if (idb) {
    payload = idb;
    from = 'idb';
  }
  return { payload, from, sources: { local: !!local, idb: !!idb }, errors };
}

// İki yere birden yazar. En az biri başarılıysa ok=true.
// -> { ok, local, idb }
export async function writeState(obj) {
  const raw = JSON.stringify(obj);
  let okLocal = false;
  let okIdb = false;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, raw);
    okLocal = true;
  } catch (e) {
    okLocal = false;
  }
  if (idbAvailable()) {
    try {
      await idbSet(STORAGE_KEY, raw);
      okIdb = true;
    } catch (e) {
      okIdb = false;
    }
  }
  return { ok: okLocal || okIdb, local: okLocal, idb: okIdb };
}

// --- kalıcılık ---

// Tarayıcıdan verinin kalıcı kovada tutulmasını ister (iOS'ta 7 gün kuralı).
export async function requestPersistentStorage() {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.storage) {
    return { supported: false, persisted: false };
  }
  if (typeof navigator.storage.persisted !== 'function') return { supported: false, persisted: false };
  try {
    let already = await navigator.storage.persisted();
    if (!already && typeof navigator.storage.persist === 'function') {
      already = await navigator.storage.persist();
    }
    return { supported: true, persisted: !!already };
  } catch (e) {
    return { supported: true, persisted: false };
  }
}

export async function isStoragePersisted() {
  if (
    Platform.OS !== 'web' ||
    typeof navigator === 'undefined' ||
    !navigator.storage ||
    typeof navigator.storage.persisted !== 'function'
  ) {
    return null;
  }
  try {
    return await navigator.storage.persisted();
  } catch (e) {
    return null;
  }
}

export async function storageEstimate() {
  if (
    Platform.OS !== 'web' ||
    typeof navigator === 'undefined' ||
    !navigator.storage ||
    typeof navigator.storage.estimate !== 'function'
  ) {
    return null;
  }
  try {
    const e = await navigator.storage.estimate();
    return { usage: e.usage || 0, quota: e.quota || 0 };
  } catch (e) {
    return null;
  }
}

// --- kurtarma taraması ---

// Cihazdaki tüm olası kayıt yerlerini okur (hiçbir şeyi değiştirmeden).
// -> { sources: [{ label, place, key, bytes, rev, savedAt, counts }], estimate, persisted, standalone, errors }
export async function scanSources() {
  const sources = [];
  const errors = [];
  const push = (label, place, key, raw, db, store) => {
    const o = parseSafe(raw);
    sources.push({
      label,
      place,
      key,
      db: db || null,
      store: store || null,
      bytes: typeof raw === 'string' ? raw.length : 0,
      rev: o ? Number(o.rev) || 0 : null,
      savedAt: o ? Number(o.savedAt) || 0 : null,
      counts: o ? countsOf(o) : null,
    });
  };

  // localStorage'daki TÜM anahtarlar (veri beklenmedik bir adla durabilir).
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const k = window.localStorage.key(i);
        push(k === STORAGE_KEY ? 'Tarayıcı belleği · ana kayıt' : 'Tarayıcı belleği · ' + k, 'local', k, window.localStorage.getItem(k));
      }
    } else {
      const keys = await AsyncStorage.getAllKeys();
      for (const k of keys) {
        // eslint-disable-next-line no-await-in-loop
        push('AsyncStorage · ' + k, 'local', k, await AsyncStorage.getItem(k));
      }
    }
  } catch (e) {
    errors.push('localStorage: ' + (e.message || 'okunamadı'));
  }

  // IndexedDB'deki tüm veritabanları/depolar/anahtarlar.
  if (idbAvailable()) {
    let names = [];
    try {
      if (indexedDB.databases) names = (await indexedDB.databases()).map((d) => d.name).filter(Boolean);
    } catch (e) {
      errors.push('databases(): ' + (e.message || ''));
    }
    if (!names.includes(DB_NAME)) names.push(DB_NAME);
    for (const name of names) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const db = await new Promise((res, rej) => {
          const q = indexedDB.open(name);
          q.onsuccess = () => res(q.result);
          q.onerror = () => rej(q.error);
          q.onblocked = () => rej(new Error('engellendi'));
        });
        for (const sn of [...db.objectStoreNames]) {
          // eslint-disable-next-line no-await-in-loop
          const rows = await new Promise((res, rej) => {
            const tx = db.transaction(sn, 'readonly');
            const st = tx.objectStore(sn);
            const kq = st.getAllKeys();
            const vq = st.getAll();
            tx.oncomplete = () => res({ keys: kq.result || [], vals: vq.result || [] });
            tx.onerror = () => rej(tx.error);
          });
          rows.keys.forEach((k, i) => push(`IndexedDB "${name}" · ${sn} · ${k}`, 'idb', String(k), rows.vals[i], name, sn));
        }
        db.close();
      } catch (e) {
        errors.push(`IndexedDB "${name}": ` + (e.message || 'açılamadı'));
      }
    }
  }

  let standalone = false;
  if (typeof window !== 'undefined') {
    try {
      standalone =
        (window.navigator && window.navigator.standalone === true) ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    } catch (e) {
      /* yoksay */
    }
  }

  // En dolu kayıt en başta.
  const score = (s) => (s.counts ? s.counts.days * 10 + s.counts.marks + s.counts.custom * 5 : -1);
  sources.sort((a, b) => score(b) - score(a));
  return {
    sources,
    estimate: await storageEstimate(),
    persisted: await isStoragePersisted(),
    standalone,
    errors,
  };
}

// Bir kaydın içinde ne kadar veri var?
export function countsOf(o) {
  const d = o && o.data && typeof o.data === 'object' ? o.data : o || {};
  const byDate = d.byDate && typeof d.byDate === 'object' ? d.byDate : {};
  const byYear = d.byYear && typeof d.byYear === 'object' ? d.byYear : {};
  const lifetime = d.lifetime && typeof d.lifetime === 'object' ? d.lifetime : {};
  let marks = 0;
  Object.keys(byDate).forEach((k) => {
    const m = byDate[k] || {};
    Object.keys(m).forEach((id) => {
      if (m[id]) marks += 1;
    });
  });
  return {
    days: Object.keys(byDate).length,
    marks,
    years: Object.keys(byYear).length,
    lifetime: Object.keys(lifetime).filter((k) => lifetime[k]).length,
    custom: Array.isArray(d.customItems) ? d.customItems.length : 0,
  };
}

// Belirli bir kaydı okur (kurtarma için).
export async function readSource(src) {
  if (src.place === 'local') {
    if (typeof window !== 'undefined' && window.localStorage) return parseSafe(window.localStorage.getItem(src.key));
    return parseSafe(await AsyncStorage.getItem(src.key));
  }
  const dbName = src.db || DB_NAME;
  const storeName = src.store || STORE;
  const db = await new Promise((res, rej) => {
    const q = indexedDB.open(dbName);
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
  const raw = await new Promise((res, rej) => {
    const tx = db.transaction(storeName, 'readonly');
    const rq = tx.objectStore(storeName).get(src.key);
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
  db.close();
  return parseSafe(raw);
}

// Paylaşılabilir metin rapor.
export function reportText(scan) {
  const mb = (n) => (n == null ? '?' : (n / 1048576).toFixed(2) + ' MB');
  const L = [];
  L.push('İBADETLERİM — DEPOLAMA RAPORU');
  L.push('ana ekran uygulaması mı: ' + (scan.standalone ? 'EVET' : 'hayır (tarayıcı sekmesi)'));
  L.push(
    'kullanılan alan: ' +
      (scan.estimate ? mb(scan.estimate.usage) + ' / ' + mb(scan.estimate.quota) : 'bilinmiyor') +
      ' · kalıcı: ' +
      (scan.persisted === null ? '?' : scan.persisted ? 'evet' : 'hayır')
  );
  L.push('');
  scan.sources.forEach((s) => {
    L.push(
      `${s.label} — ${(s.bytes / 1024).toFixed(1)} KB` +
        (s.counts
          ? ` → ${s.counts.days} gün, ${s.counts.marks} işaret, ${s.counts.custom} ilave ibadet (rev ${s.rev})`
          : ' → tanınmayan içerik')
    );
  });
  if (scan.errors.length) {
    L.push('');
    L.push('sorunlar: ' + scan.errors.join(' | '));
  }
  return L.join('\n');
}
